import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChatCursorPayload } from '@/shared/utils/chatting.cursor';
import { Injectable } from '@nestjs/common';
import {
  CreateChattingMessageInput,
  IChattingMessagesRepository,
} from '../interface/chatting-messages.repository.interface';
import { ChattingMessageEntity } from '../types';
import { InternalServerException } from '@/shared/exceptions/internal-server-error.exception';

@Injectable()
export class PrismaChattingMessagesRepository implements IChattingMessagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateChattingMessageInput, ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);

    const message = await db.chattingMessage.create({
      data: input,
    });
    return message;
  }

  findById(messageId: string, ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);
    return db.chattingMessage.findUnique({
      where: { id: messageId },
      include: {
        quotation: true,
      },
    });
  }

  async findByRoomId(
    roomId: string,
    take: number,
    cursor?: ChatCursorPayload,
    ctx?: TransactionContext,
  ): Promise<ChattingMessageEntity[]> {
    const db = getDb(ctx, this.prisma);

    try {
      const rows = await db.chattingMessage.findMany({
        where: {
          chattingRoomId: roomId,
        },
        orderBy: {
          sequence: 'desc', // 최신 메시지부터 가져오기 (limit=30이면 최신 30개)
        },
        cursor: cursor
          ? {
              chattingRoomId_sequence: {
                chattingRoomId: roomId,
                sequence: cursor.sequence,
              },
            }
          : undefined,
        skip: cursor ? 1 : 0,
        take,
      });

      // DESC로 가져왔으므로 다시 역순으로 뒤집어서 오래된 것부터 최신 순서로 반환
      return rows.reverse() as ChattingMessageEntity[];
    } catch {
      throw new InternalServerException('채팅 메시지를 조회하는 중 오류가 발생했습니다.');
    }
  }
}
