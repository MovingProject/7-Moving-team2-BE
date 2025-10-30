import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { Injectable } from '@nestjs/common';
import {
  CreateChattingMessageInput,
  IChattingMessagesRepository,
} from '../interface/chatting-messages.repository.interface';

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
}
