import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ChattingMessageEntity } from '../types';

export type ChattingMessageView = ChattingMessageEntity & {
  isMine: boolean;
};

export interface GetChatMessagesResponse {
  roomId: string;
  messages: ChattingMessageView[];
  pageInfo: {
    hasNext: boolean;
    nextCursor: string | null;
  };
  lastReadMessageId?: string | null;
}

export interface IChattingRoomsService {
  createOrGetRoomByDriver(
    input: {
      requestId: string;
      consumerId: string;
    },
    user: AccessTokenPayload,
  ): Promise<{ roomId: string }>;

  getMessages(
    input: { roomId: string; cursor?: string; limit: number },
    user: AccessTokenPayload,
  ): Promise<GetChatMessagesResponse>;
}

export const CHATTING_ROOMS_SERVICE = 'IChattingRoomsService';
