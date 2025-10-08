import { BadRequestException, ConflictException, ForbiddenException, UnauthorizedException } from '@/shared/exceptions';
// remove prisma dependency from service layer
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { Inject, Injectable } from '@nestjs/common';
import { type IUserRepository, USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { CreateQuoteRequestBody } from './dto/create-quote-request.dto';
import { REQUEST_REPOSITORY } from './interface/request.repository.interface';
import { type IRequestRepository } from './interface/request.repository.interface';
import { type IRequestService } from './interface/request.service.interface';
import { getAreaFromAddress } from '@/shared/utils/address.util';
import { CreateRequestData } from './types';
import { PendingRequestConflictError } from './interface/errors';

@Injectable()
export class RequestService implements IRequestService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: IRequestRepository,
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

    try {
      const newRequest = await this.requestRepository.createRequest(createData);
      return newRequest;
    } catch (e) {
      if (e instanceof PendingRequestConflictError) {
        throw new ConflictException(
          '이미 진행중인 요청이 있습니다. 기존 요청을 완료하거나 취소한 뒤 다시 시도해주세요.',
        );
      }
      throw e;
    }
  }
}
