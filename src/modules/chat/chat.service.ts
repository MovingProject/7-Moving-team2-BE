import { Inject, Injectable } from '@nestjs/common';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import {
  CHATTING_ROOMS_REPOSITORY,
  type IChattingRoomsRepository,
} from './interface/chatting-rooms.repository.interface';
import { IChattingRoomsService } from './interface/chatting-rooms.service.interface';
import { USER_REPOSITORY, type IUserRepository } from '../users/interface/users.repository.interface';
import { ForbiddenException, NotFoundException } from '@/shared/exceptions';
import { TRANSACTION_RUNNER, type ITransactionRunner } from '@/shared/prisma/transaction-runner.interface';
import { type IRequestRepository, REQUEST_REPOSITORY } from '../requests/interface/request.repository.interface';

@Injectable()
export default class ChatService implements IChattingRoomsService {
  constructor(
    @Inject(CHATTING_ROOMS_REPOSITORY)
    private readonly chattingRoomsRepository: IChattingRoomsRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transactionRunner: ITransactionRunner,
    @Inject(REQUEST_REPOSITORY)
    private readonly requestRepository: IRequestRepository,
  ) {}

  async createOrGetRoomByDriver(input: { requestId: string; consumerId: string }, user: AccessTokenPayload) {
    return this.transactionRunner.run(async (ctx) => {
      const { requestId, consumerId } = input;

      const driver = await this.userRepository.findById(user.sub, ctx);
      if (!driver) {
        throw new NotFoundException('드라이버 정보를 찾을 수 없습니다.');
      }
      if (driver.role !== 'DRIVER') {
        throw new ForbiddenException('드라이버만 채팅방을 생성할 수 있습니다.');
      }

      const consumer = await this.userRepository.findById(consumerId, ctx);
      if (!consumer) {
        throw new NotFoundException('해당 소비자를 찾을 수 없습니다.');
      }

      if (consumer.role !== 'CONSUMER') {
        throw new ForbiddenException('소비자에게만 채팅방을 개설할 수 있습니다.');
      }

      const request = await this.requestRepository.findById(requestId, ctx);
      if (!request) {
        throw new NotFoundException('해당 요청을 찾을 수 없습니다.');
      }

      if (request.requestStatus !== 'PENDING') {
        throw new ForbiddenException('해당 요청은 진행중이 아닙니다.');
      }

      if (request.consumerId !== consumerId) {
        throw new ForbiddenException('해당 요청의 소비자에게만 채팅을 시작할 수 있습니다.');
      }

      const result = await this.chattingRoomsRepository.createOrGetRoomByDriver(requestId, consumerId, driver.id, ctx);

      return result;
    });
  }
}
