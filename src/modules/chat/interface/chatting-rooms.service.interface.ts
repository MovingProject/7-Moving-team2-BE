import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { ChattingMessageEntity } from '../types';
import { MessageType } from '@/shared/constant/values';

export type ChattingMessageView = ChattingMessageEntity & {
  isMine: boolean;
};

export interface GetChatMessagesResponse {
  roomId: string;
  requestId: string; // 견적 요청 ID (견적 보내기에 필요)
  messages: ChattingMessageView[];
  pageInfo: {
    hasNext: boolean;
    nextCursor: string | null;
  };
  lastReadMessageId?: string | null;
}

export type OtherUserBrief = {
  userId: string;
  role: 'CONSUMER' | 'DRIVER';
  name: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type LastMessageBrief = {
  id: string;
  type: MessageType;
  content: string | null;
  createdAt: string;
};

export type ChatRoomListItem = {
  roomId: string;
  requestId: string; // 이사 요청 ID (견적 보내기에 필요)
  other: OtherUserBrief;
  lastMessage: LastMessageBrief | null;
  unreadCount: number;
  updatedAt: string;
  closed: boolean;
};

export interface IChattingRoomsService {
  createOrGetRoomByDriver(
    input: {
      requestId: string;
      consumerId: string;
    },
    user: AccessTokenPayload,
  ): Promise<{ roomId: string }>;
  getMyRooms(user: AccessTokenPayload): Promise<ChatRoomListItem[]>;
  getMessages(
    input: { roomId: string; cursor?: string; limit: number },
    user: AccessTokenPayload,
  ): Promise<GetChatMessagesResponse>;
}

export const CHATTING_ROOMS_SERVICE = 'IChattingRoomsService';
