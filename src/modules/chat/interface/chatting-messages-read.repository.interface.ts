import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChatMessageReadEntity } from '../types';

export interface IChattingMessagesReadRepository {
  upsertRead(messageId: string, userId: string, ctx?: TransactionContext): Promise<void>;
  findLastReadByUser(roomId: string, userId: string, ctx?: TransactionContext): Promise<ChatMessageReadEntity | null>;
  countUnreadByRooms(meId: string, roomIds: string[], ctx?: TransactionContext): Promise<Map<string, number>>;
}

export const CHATTING_MESSAGES_READ_REPOSITORY = 'IChattingMessagesReadRepository';
