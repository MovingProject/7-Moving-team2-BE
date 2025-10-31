import { IChattingMessagesReadRepository } from '../interface/chatting-messages-read.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { getDb } from '@/shared/prisma/get-db';

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
      update: {},
      create: {
        messageId,
        userId,
      },
    });
  }
}
