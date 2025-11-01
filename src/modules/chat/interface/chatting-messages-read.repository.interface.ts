import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChatMessageReadEntity } from '../types';

export interface IChattingMessagesReadRepository {
  upsertRead(messageId: string, userId: string, ctx?: TransactionContext): Promise<void>;
  findLastReadByUser(roomId: string, userId: string, ctx?: TransactionContext): Promise<ChatMessageReadEntity | null>;
}

export const CHATTING_MESSAGES_READ_REPOSITORY = 'IChattingMessagesReadRepository';
