import { ForbiddenException, NotFoundException } from '@/shared/exceptions';
import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { TRANSACTION_RUNNER, type ITransactionRunner } from '@/shared/prisma/transaction-runner.interface';
import { decodeChatCursor, encodeChatCursor } from '@/shared/utils/chatting.cursor';
import { Inject, Injectable } from '@nestjs/common';
import { REQUEST_REPOSITORY, type IRequestRepository } from '../requests/interface/request.repository.interface';
import { USER_REPOSITORY, type IUserRepository } from '../users/interface/users.repository.interface';
import {
  CHATTING_MESSAGES_READ_REPOSITORY,
  type IChattingMessagesReadRepository,
} from './interface/chatting-messages-read.repository.interface';
import {
  CHATTING_MESSAGES_REPOSITORY,
  type IChattingMessagesRepository,
} from './interface/chatting-messages.repository.interface';
import {
  CHATTING_ROOMS_REPOSITORY,
  type IChattingRoomsRepository,
} from './interface/chatting-rooms.repository.interface';
import {
  IChattingRoomsService,
  ChattingMessageView,
  ChatRoomListItem,
  OtherUserBrief,
  LastMessageBrief,
} from './interface/chatting-rooms.service.interface';
import { ChattingMessageEntity } from './types';

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
    @Inject(CHATTING_MESSAGES_REPOSITORY)
    private readonly messagesRepository: IChattingMessagesRepository,
    @Inject(CHATTING_MESSAGES_READ_REPOSITORY)
    private readonly readRepository: IChattingMessagesReadRepository,
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

  async getMyRooms(user: AccessTokenPayload) {
    const meId = user.sub;

    const allRooms = await this.chattingRoomsRepository.findJoinableByUser(meId);

    const rooms = user.role === 'CONSUMER' ? allRooms.filter((room) => room.lastMessage) : allRooms;

    const roomIds = rooms.map((r) => r.id);
    const unreadMap = await this.readRepository.countUnreadByRooms(meId, roomIds);

    return rooms.map<ChatRoomListItem>((r) => {
      const iAmConsumer = r.consumer.id === meId;
      const otherRaw = iAmConsumer ? r.driver : r.consumer;

      const other: OtherUserBrief = {
        userId: otherRaw.id,
        role: otherRaw.role,
        name: otherRaw.name,
        displayName: otherRaw.role === 'DRIVER' ? (otherRaw.nickname ?? otherRaw.name) : otherRaw.name,
        avatarUrl: otherRaw.avatarUrl ?? null,
      };

      const lastMessage: LastMessageBrief | null = r.lastMessage
        ? {
            id: r.lastMessage.id,
            type: r.lastMessage.type,
            content: r.lastMessage.content,
            createdAt: r.lastMessage.createdAt.toISOString(),
          }
        : null;

      return {
        roomId: r.id,
        requestId: r.requestId,
        other,
        lastMessage,
        unreadCount: unreadMap.get(r.id) ?? 0,
        updatedAt: r.updatedAt.toISOString(),
        closed: !!r.closedAt,
      };
    });
  }

  async getMessages(input: { roomId: string; cursor: string; limit: number }, user: AccessTokenPayload) {
    const { roomId, cursor, limit = 30 } = input;
    const userId = user.sub;

    // 1) 방 존재 여부 확인
    const room = await this.chattingRoomsRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다.');
    }

    // 2) 참여자 여부 확인
    const isParticipant = room.consumerId === userId || room.driverId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('해당 채팅방의 참여자만 메시지를 조회할 수 있습니다.');
    }

    // 3) 메시지 조회 (cursor 기반)
    //    - limit + 1 로 가져와서 hasNext 판단
    const decoded = cursor ? decodeChatCursor(cursor) : undefined;
    const rawMessages = await this.messagesRepository.findByRoomId(roomId, limit + 1, decoded);

    // 5) 다음 페이지 여부/목록 자르기
    // Repository에서 DESC로 가져온 후 reverse()하므로: [오래된...최신]
    // hasNext가 true면 맨 앞(가장 오래된) 1개를 제거
    const hasNext = rawMessages.length > limit;
    const messages = hasNext ? rawMessages.slice(1) : rawMessages;

    // 6) nextCursor 계산 (가장 오래된 메시지의 sequence 사용)
    const nextCursor = hasNext && messages.length > 0 ? encodeChatCursor({ sequence: messages[0].sequence }) : null;

    // 7) 읽음 정보 가져오기
    const lastRead = await this.readRepository.findLastReadByUser(roomId, userId);
    const lastReadMessageId = lastRead ? lastRead.messageId : null;

    // 8) 최종 응답
    return {
      roomId,
      requestId: room.requestId, // 견적 요청 ID 추가
      messages: messages.map((m) => this.toEntityWithMine(m, userId)),
      pageInfo: {
        hasNext,
        nextCursor,
      },
      lastReadMessageId,
    };
  }

  private toEntityWithMine(raw: ChattingMessageEntity, userId: string): ChattingMessageView {
    return {
      id: raw.id,
      chattingRoomId: raw.chattingRoomId,
      senderId: raw.senderId,
      content: raw.content,
      messageType: raw.messageType,
      sequence: raw.sequence,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      quotation: raw.quotation ?? null,
      isMine: raw.senderId === userId,
    };
  }
}
