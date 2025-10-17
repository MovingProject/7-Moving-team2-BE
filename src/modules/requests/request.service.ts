import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@/shared/exceptions';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { type ITransactionRunner, TRANSACTION_RUNNER } from '@/shared/prisma/transaction-runner.interface';
import { getAreaFromAddress } from '@/shared/utils/address.util';
import { Inject, Injectable } from '@nestjs/common';
import { type IUserRepository, USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { CreateQuoteRequestBody } from './dto/create-quote-request.dto';
import { type IInviteRepository, INVITE_REPOSITORY } from './interface/invite.repository.interface';
import { type IRequestRepository, REQUEST_REPOSITORY } from './interface/request.repository.interface';
import { type IRequestService } from './interface/request.service.interface';
import { CreateRequestData } from './types';
import { InviteResult } from './interface/request.service.interface';

import { ReceivedRequestsResponseSchema, ReceivedRequest } from './dto/request-quote-request-received.dto';
import { ReceivedRequestFilter } from './dto/request-filter-post.dto';
import { DriverRequestActionDTO } from './dto/request-reject-request-received.dto';
import { PrismaClient } from '@prisma/client';
@Injectable()
export class RequestService implements IRequestService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: IRequestRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: ITransactionRunner,
    @Inject(INVITE_REPOSITORY)
    private readonly inviteRepository: IInviteRepository,
  ) {}

  async createQuoteRequest(dto: CreateQuoteRequestBody, user: AccessTokenPayload) {
    const { sub } = user;

    const existingUser = await this.userRepository.findById(sub);
    if (!existingUser) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    if (existingUser.role !== 'CONSUMER') {
      throw new ForbiddenException('CONSUMER만 사용할 수 있는 서비스입니다.');
    }
    const pendingRequest = await this.requestRepository.findPendingByConsumerId(sub);

    if (pendingRequest) {
      throw new ConflictException(
        '이미 진행중인 요청이 있습니다. 기존 요청을 완료하거나 취소한 뒤 다시 시도해주세요. ',
      );
    }

    const departureArea = getAreaFromAddress(dto.departureAddress);
    const arrivalArea = getAreaFromAddress(dto.arrivalAddress);

    if (!departureArea || !arrivalArea) {
      throw new BadRequestException('출발지 또는 도착지 주소가 유효하지 않습니다. 시/도부터 정확히 입력해주세요.');
    }

    const createData: CreateRequestData = {
      consumerId: sub,
      serviceType: dto.serviceType,
      moveAt: dto.moveAt,
      departureAddress: dto.departureAddress,
      departureFloor: dto.departureFloor,
      departurePyeong: dto.departurePyeong,
      departureElevator: dto.departureElevator,
      arrivalAddress: dto.arrivalAddress,
      arrivalFloor: dto.arrivalFloor,
      arrivalPyeong: dto.arrivalPyeong,
      arrivalElevator: dto.arrivalElevator,
      additionalRequirements: dto.additionalRequirements,
      departureArea: departureArea,
      arrivalArea: arrivalArea,
    };

    const newRequest = await this.requestRepository.createRequest(createData);
    return newRequest;
  }

  async findReceivedByDriverId(driverId: string) {
    const result = await this.requestRepository.findInvitesByDriverId(driverId);

    if (!result) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }
    if (Array.isArray(result) && result.length === 0) {
      throw new NotFoundException('결과값이 비어있습니다.');
    }

    return ReceivedRequestsResponseSchema.parse(result);
  }

  async inviteToRequest(driverId: string, user: AccessTokenPayload): Promise<InviteResult> {
    const existingDriver = await this.userRepository.findById(driverId);
    if (!existingDriver) {
      throw new NotFoundException('기사를 찾을 수 없습니다.');
    }

    if (existingDriver.role !== 'DRIVER') {
      throw new ForbiddenException('CONSUMER에게 견적을 보낼 수 없습니다.');
    }

    if (!existingDriver.driverProfile) {
      throw new ForbiddenException('기사 프로필이 완성되지 않아 초대를 보낼 수 없습니다.');
    }

    const existingUser = await this.userRepository.findById(user.sub);
    if (!existingUser) {
      throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    }

    const result = await this.transactionRunner.run(async (ctx) => {
      const pendingRequest = await this.requestRepository.findPendingByConsumerId(user.sub, ctx);
      if (!pendingRequest) {
        throw new ConflictException('진행중인 요청이 없습니다. 요청을 생성해주세요.');
      }

      if (pendingRequest.invitedQuoteCount >= pendingRequest.invitedQuoteLimit) {
        throw new ConflictException('지정견적 요청 수를 초과하여 더 이상 지정 요청을 할 수 없습니다.');
      }

      const driverAreas = existingDriver.driverProfile?.driverServiceAreas.map((a) => a.serviceArea) ?? [];
      const coversDeparture = driverAreas.includes(pendingRequest.departureArea);
      const coversArrival = driverAreas.includes(pendingRequest.arrivalArea);

      if (!coversDeparture || !coversArrival) {
        throw new ForbiddenException('해당 기사 서비스 지역과 요청 지역이 일치하지 않습니다.');
      }

      const driverTypes = existingDriver.driverProfile?.driverServiceTypes.map((t) => t.serviceType) ?? [];
      if (!driverTypes.includes(pendingRequest.serviceType)) {
        throw new ForbiddenException('해당 기사 서비스 타입이 요청과 일치하지 않습니다.');
      }

      const inserted = await this.inviteRepository.insertIfAbsent(pendingRequest.id, driverId, ctx);
      if (!inserted) {
        return { invited: true, alreadyExisted: true };
      }
      const ok = await this.requestRepository.incrementInvitedCountIfAvailable(pendingRequest.id, ctx);
      if (!ok) {
        throw new ConflictException('지정견적 요청 수를 초과하여 더 이상 지정 요청을 할 수 없습니다.');
      }

      return { invited: true, alreadyExisted: false };
    });

    return result;
  }
  async filterReceivedRequests(driverId: string, filter: ReceivedRequestFilter) {
    console.log('filter received(서비스):', filter);
    const result = await this.requestRepository.filterRequests(driverId, filter);
    if (!result) throw new UnauthorizedException('유효하지 않은 사용자입니다.');
    if (Array.isArray(result) && result.length === 0) throw new NotFoundException('조건에 맞는 결과가 없습니다.');

    return ReceivedRequestsResponseSchema.parse(result);
  }

  async countRequests(driverId: string) {
    return this.requestRepository.countRequests(driverId);
  }

  async rejecctRequest(driverId: string, dto: DriverRequestActionDTO) {
    return this.transactionRunner.run(async (ctx) => {
      const tx = ctx.tx as PrismaClient;

      const request = await this.requestRepository.findById(dto.requestId);

      if (!request) throw new NotFoundException('요청을 찾을수가 없습니다.');

      return this.requestRepository.createDriverAction(tx, dto);
    });
  }
}
