import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

export interface IChattingMessagesReadRepository {
  upsertRead(messageId: string, userId: string, ctx?: TransactionContext): Promise<void>;
}

export const CHATTING_MESSAGES_READ_REPOSITORY = 'IChattingMessagesReadRepository';
