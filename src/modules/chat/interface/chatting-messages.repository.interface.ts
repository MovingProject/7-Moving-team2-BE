import { MessageType } from '@/shared/constant/values';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChattingMessageRecord } from '../types';
import { ChattingMessageEntity } from '../types';
export type CreateChattingMessageInput = {
  chattingRoomId: string;
  senderId: string;
  messageType: MessageType;
  content?: string | null;
  sequence: number;
};

export interface IChattingMessagesRepository {
  create(input: CreateChattingMessageInput, ctx?: TransactionContext): Promise<ChattingMessageRecord>;
  findById(messageId: string, ctx?: TransactionContext): Promise<ChattingMessageEntity | null>;
}

export const CHATTING_MESSAGES_REPOSITORY = 'IChattingMessagesRepository';
