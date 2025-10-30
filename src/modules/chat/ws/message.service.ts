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

@Injectable()
export class ChatMessageWsService {
  private readonly logger = new Logger(ChatMessageWsService.name);

  constructor(
    @Inject(TRANSACTION_RUNNER) private readonly tx: ITransactionRunner,
    @Inject(CHATTING_ROOMS_REPOSITORY) private readonly roomsRepo: IChattingRoomsRepository,
    @Inject(CHATTING_MESSAGES_REPOSITORY) private readonly msgsRepo: IChattingMessagesRepository,
    @Inject(QUOTATION_REPOSITORY) private readonly quotationRepo: IQuotationRepository, // 견적 생성용
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

    const result = await this.tx.run(async (ctx) => {
      const nextIdx = await this.roomsRepo.incrementNextSequence(room.id, ctx);
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

        const newQuotation = await this.quotationRepo.create(quotationInput, ctx);
        return { message: savedMessage, quotation: newQuotation };
      }
      return { message: savedMessage };
    });

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
  }
}
