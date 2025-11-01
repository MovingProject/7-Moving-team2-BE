import { MessageType } from '@/shared/constant/values';
import { QuotationEntity } from '../quotations/types';
export type ChattingRoomEntity = {
  id: string;
  consumerId: string;
  driverId: string;
  requestId: string;
  nextSequence: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  closedAt: Date | null;
};

export type ChattingMessageEntity = {
  id: string;
  chattingRoomId: string;
  senderId: string;
  messageType: MessageType;
  quotation: QuotationEntity | null;
  content: string | null;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ChattingMessageRecord = {
  id: string;
  chattingRoomId: string;
  senderId: string;
  messageType: MessageType;
  content: string | null;
  sequence: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageReadEntity = {
  messageId: string;
  userId: string;
  readAt: Date;
};
