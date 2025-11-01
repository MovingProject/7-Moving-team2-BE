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
}
