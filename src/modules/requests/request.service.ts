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
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
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
import { PrismaClient, Quotation } from '@prisma/client';
import { RequestListDto } from './dto/request-list.dto';
import { RequestCheckResponseDto } from './dto/request-check.dto';
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

  async rejectRequest(driverId: string, dto: DriverRequestActionDTO) {
    return this.transactionRunner.run(async (ctx) => {
      const request = await this.requestRepository.findById(dto.requestId);

      if (!request) throw new NotFoundException('요청을 찾을수가 없습니다.');

      if (request.requestStatus !== 'PENDING') {
        throw new ConflictException('이미 완료되었거나 취소된 요청은 반려할 수 없습니다.');
      }

      const input = {
        ...dto,
        driverId,
        state: 'REJECTED',
        source: request.invites.some((i) => i.driverId === driverId) ? 'INVITED' : 'GENERAL',
      };

      return this.requestRepository.createDriverAction(ctx.tx as PrismaClient, input);
    });
  }

  async getConsumerRequests(consumerId: string): Promise<RequestListDto[]> {
    const requests = await this.requestRepository.findAllByConsumerId(consumerId);

    if (!requests || requests.length === 0) {
      throw new NotFoundException('조회 가능한 요청이 없습니다.');
    }

    const mappedRequests: RequestListDto[] = requests.map((req) => {
      const quotations = req.quotations.map((q) => {
        const driverProfile = q.driver.driverProfile;
        const withLiked = q as Quotation & { isLiked?: boolean };

        return {
          id: withLiked.id,
          driverNickname: driverProfile?.nickname ?? '미등록 기사',
          price: withLiked.price,
          status: withLiked.status,
          chattingRoomId: withLiked.chattingRoomId,
          serviceType: withLiked.serviceType,
          isLiked: withLiked.isLiked ?? false,
          isInvited: !!req.invites.find((i) => i.driverId === withLiked.driverId),
          driverProfile: {
            nickname: driverProfile?.nickname ?? '',
            oneLiner: driverProfile?.oneLiner ?? null,
            likeCount: driverProfile?.likeCount ?? 0,
            reviewCount: driverProfile?.reviewCount ?? 0,
            rating: driverProfile?.rating ?? 0,
            careerYears: driverProfile?.careerYears ?? 0,
            confirmedCount: driverProfile?.confirmedCount ?? 0,
            image: driverProfile?.image ?? null,
          },
        };
      });

      return {
        id: req.id,
        departureAddress: req.departureAddress,
        arrivalAddress: req.arrivalAddress,
        createdAt: req.createdAt.toISOString(),
        serviceType: req.serviceType,
        moveAt: req.moveAt,
        requestStatus: req.requestStatus,
        additionalRequirements: req.additionalRequirements ?? null,
        quotations,
      };
    });

    return mappedRequests;
  }
  async checkPendingRequest(consumerId: string): Promise<RequestCheckResponseDto> {
    if (!consumerId) {
      throw new UnauthorizedException('로그인 정보가 유효하지 않습니다.');
    }

    const pending = await this.requestRepository.findPendingByConsumerId(consumerId);

    if (!pending) {
      return { pendingRequest: null };
    }

    return {
      pendingRequest: {
        id: pending.id,
        serviceType: pending.serviceType,
        moveAt: pending.moveAt.toISOString(),
        departureAddress: pending.departureAddress,
        departureFloor: pending.departureFloor,
        departureElevator: pending.departureElevator,
        departurePyeong: pending.departurePyeong,
        arrivalAddress: pending.arrivalAddress,
        arrivalFloor: pending.arrivalFloor,
        arrivalElevator: pending.arrivalElevator,
        arrivalPyeong: pending.arrivalPyeong,
        additionalRequirements: pending.additionalRequirements ?? null,
      },
    };
  }

  async getRequestById(requestId: string) {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('견적 요청서를 찾을 수 없습니다.');
    }
    return request;
  }
}
