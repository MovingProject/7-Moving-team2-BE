import {
  type IChattingMessagesRepository,
  CHATTING_MESSAGES_REPOSITORY,
  CreateChattingMessageInput,
} from '@/modules/chat/interface/chatting-messages.repository.interface';
import {
  type IChattingRoomsRepository,
  CHATTING_ROOMS_REPOSITORY,
} from '@/modules/chat/interface/chatting-rooms.repository.interface';
import {
  type IQuotationRepository,
  CreateQuotationInput,
  QUOTATION_REPOSITORY,
} from '@/modules/quotations/interface/quotation.repository.interface';
import { type ITransactionRunner, TRANSACTION_RUNNER } from '@/shared/prisma/transaction-runner.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { SendMessageBody } from './dto/send-message.dto';
import { ok, fail } from './ws.ack';
import type { WsSocket } from './ws.types';
import { WS_EVENTS } from './ws.events';
import { type IChattingMessagesReadRepository } from '../interface/chatting-messages-read.repository.interface';
import { CHATTING_MESSAGES_READ_REPOSITORY } from '../interface/chatting-messages-read.repository.interface';
import { ChatReadBody } from './dto/chat-read.dto';
import { NotificationService } from '@/modules/notification/notification.service';
import { BadRequestException } from '@shared/exceptions/bad-request.exception';

@Injectable()
export class ChatMessageWsService {
  private readonly logger = new Logger(ChatMessageWsService.name);

  constructor(
    @Inject(TRANSACTION_RUNNER) private readonly tx: ITransactionRunner,
    @Inject(CHATTING_ROOMS_REPOSITORY) private readonly roomsRepo: IChattingRoomsRepository,
    @Inject(CHATTING_MESSAGES_REPOSITORY) private readonly msgsRepo: IChattingMessagesRepository,
    @Inject(QUOTATION_REPOSITORY) private readonly quotationRepo: IQuotationRepository,
    @Inject(CHATTING_MESSAGES_READ_REPOSITORY) private readonly msgsReadRepo: IChattingMessagesReadRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async sendMessage(client: WsSocket, input: SendMessageBody) {
    const user = client.data.user;
    if (!user) return fail('AUTH_REQUIRED', '로그인이 필요합니다.');

    const room = await this.roomsRepo.findById(input.roomId);
    if (!room || room.deletedAt) return fail('ROOM_NOT_FOUND', '대화방이 없습니다.');
    if (room.closedAt) return fail('SEND_DENIED', '종료된 대화방입니다.');
    if (room.consumerId !== user.id && room.driverId !== user.id) {
      return fail('SEND_DENIED', '이 방에 참여할 수 없습니다.');
    }
    try {
      const result = await this.tx.run(async (ctx) => {
        const nextIdx = await this.roomsRepo.incrementNextSequence(room.id, ctx);

        if (nextIdx === 1 && input.messageType !== 'QUOTATION') {
          throw new BadRequestException('FIRST_MESSAGE_MUST_BE_QUOTATION');
        }

        const createInput: CreateChattingMessageInput = {
          chattingRoomId: room.id,
          senderId: user.id,
          messageType: input.messageType,
          sequence: nextIdx,
          content: input.messageType === 'MESSAGE' ? input.content : null,
        };

        const savedMessage = await this.msgsRepo.create(createInput, ctx);

        if (input.messageType === 'QUOTATION') {
          const quotationInput: CreateQuotationInput = {
            consumerId: room.consumerId,
            driverId: room.driverId,
            chattingRoomId: room.id,
            requestId: room.requestId,
            serviceType: input.quotation.serviceType,
            moveAt: input.quotation.moveAt,
            departureAddress: input.quotation.departureAddress,
            departureFloor: input.quotation.departureFloor,
            departurePyeong: input.quotation.departurePyeong,
            departureElevator: input.quotation.departureElevator,
            arrivalAddress: input.quotation.arrivalAddress,
            arrivalFloor: input.quotation.arrivalFloor,
            arrivalPyeong: input.quotation.arrivalPyeong,
            arrivalElevator: input.quotation.arrivalElevator,
            additionalRequirements: input.quotation.additionalRequirements ?? null,
            price: input.quotation.price,
            previousQuotationId: input.quotation.previousQuotationId ?? null,
            validUntil: input.quotation.validUntil ?? null,
            chattingMessageId: savedMessage.id,
          };

          const newQuotation = await this.quotationRepo.upsertForRequestDriver(quotationInput, ctx);
          return { message: savedMessage, quotation: newQuotation, isFirst: nextIdx === 1 };
        }

        return { message: savedMessage, quotation: null, isFirst: nextIdx === 1 };
      });

      if (result.isFirst && user.id === room.driverId) {
        await this.notificationService.createNotification({
          receiverId: room.consumerId,
          senderId: user.id,
          notificationType: 'NEW_MESSAGE',
          content: '기사님과의 채팅이 시작되었습니다.',
          chattingRoomId: room.id,
          requestId: room.requestId,
          quotationId: result.quotation?.id ?? undefined,
        });
      }

      if (result.message.messageType === 'MESSAGE') {
        const payload = {
          roomId: room.id,
          msg: {
            id: result.message.id,
            idx: result.message.sequence,
            authorId: result.message.senderId,
            messageType: 'MESSAGE' as const,
            body: result.message.content!,
            sentAt: result.message.createdAt.toISOString(),
            tempId: input.tempId,
          },
        };
        client.to(`room:${room.id}`).emit(WS_EVENTS.CHAT_NEW, payload);
        client.emit(WS_EVENTS.CHAT_NEW, payload);
      } else {
        const payload = {
          roomId: room.id,
          msg: {
            id: result.message.id,
            idx: result.message.sequence,
            authorId: result.message.senderId,
            messageType: 'QUOTATION' as const,
            quotationId: result.quotation!.id,
            sentAt: result.message.createdAt.toISOString(),
            tempId: input.tempId,
          },
        };
        client.to(`room:${room.id}`).emit(WS_EVENTS.CHAT_NEW, payload);
        client.emit(WS_EVENTS.CHAT_NEW, payload);
      }

      return ok({ delivered: true, id: result.message.id, idx: result.message.sequence });
    } catch (e) {
      if (e instanceof BadRequestException && e.message === 'FIRST_MESSAGE_MUST_BE_QUOTATION') {
        return fail('FIRST_MESSAGE_MUST_BE_QUOTATION', '첫 메시지는 견적(QUOTATION)으로만 보낼 수 있습니다.', {
          tempId: input.tempId,
        });
      }

      this.logger.error(`chat:send failed: ${String((e as Error).message ?? e)}`);
      return fail('MESSAGE_SEND_FAILED', undefined, { tempId: input.tempId });
    }
  }

  async readMessage(client: WsSocket, input: ChatReadBody) {
    const user = client.data.user;
    if (!user) return fail('AUTH_REQUIRED', '로그인이 필요합니다.');

    const message = await this.msgsRepo.findById(input.lastReadMessageId);
    if (!message) {
      return fail('MESSAGE_NOT_FOUND', '메시지를 찾을 수 없습니다.');
    }

    const room = await this.roomsRepo.findById(message.chattingRoomId);
    if (!room) {
      return fail('ROOM_NOT_FOUND', '대화방을 찾을 수 없습니다.');
    }

    const isParticipant = room.consumerId === user.id || room.driverId === user.id;
    if (!isParticipant) {
      return fail('READ_DENIED', '이 채팅방의 메시지가 아닙니다.');
    }

    await this.msgsReadRepo.upsertRead(message.id, user.id);

    // TODO: 상대방에게 읽음 이벤트 보내기

    return ok({
      messageId: message.id,
      roomId: room.id,
    });
  }
}
