import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { Injectable } from '@nestjs/common';
import { IChattingMessagesReadRepository } from '../interface/chatting-messages-read.repository.interface';
import { ChatMessageReadEntity } from '../types';

@Injectable()
export class PrismaChattingMessagesReadRepository implements IChattingMessagesReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertRead(messageId: string, userId: string, ctx?: TransactionContext): Promise<void> {
    const db = getDb(ctx, this.prisma);

    await db.chatMessageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
        messageId,
      },
      create: {
        messageId,
        userId,
      },
    });
  }

  async findLastReadByUser(
    roomId: string,
    userId: string,
    ctx?: TransactionContext,
  ): Promise<ChatMessageReadEntity | null> {
    const db = getDb(ctx, this.prisma);

    const row = await db.chatMessageRead.findFirst({
      where: {
        userId,
        message: {
          chattingRoomId: roomId,
        },
      },
      orderBy: {
        message: {
          sequence: 'desc',
        },
      },
      include: {
        message: true,
      },
    });

    return row as ChatMessageReadEntity | null;
  }

  async countUnreadByRooms(meId: string, roomIds: string[]): Promise<Map<string, number>> {
    if (roomIds.length === 0) return new Map();

    const rows = await this.prisma.$queryRaw<{ chatting_room_id: string; unread: bigint }[]>`
      SELECT m."chattingRoomId" AS chatting_room_id, COUNT(*)::bigint AS unread
      FROM "ChattingMessage" m
      LEFT JOIN "ChatMessageRead" r
        ON r."messageId" = m."id" AND r."userId" = ${meId}
      WHERE m."chattingRoomId" = ANY(${roomIds})
        AND m."senderId" <> ${meId}
        AND r."messageId" IS NULL
      GROUP BY m."chattingRoomId"
    `;

    const map = new Map<string, number>();
    for (const row of rows) map.set(row.chatting_room_id, Number(row.unread));
    return map;
  }
}
