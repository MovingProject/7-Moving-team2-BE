import { MessageType } from '@/shared/constant/values';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChattingMessageRecord } from '../types';
import { ChattingMessageEntity } from '../types';
import { ChatCursorPayload } from '@/shared/utils/chatting.cursor';

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
  findByRoomId(
    roomId: string,
    take: number,
    cursor?: ChatCursorPayload,
    ctx?: TransactionContext,
  ): Promise<ChattingMessageEntity[]>;
}

export const CHATTING_MESSAGES_REPOSITORY = 'IChattingMessagesRepository';
