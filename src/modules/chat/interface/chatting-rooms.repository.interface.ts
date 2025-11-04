import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChattingRoomEntity } from '../types';
import { MessageType } from '@/shared/constant/values';

export type RoomParticipant = {
  id: string;
  role: 'CONSUMER' | 'DRIVER';
  name: string;
  avatarUrl?: string | null;
  nickname?: string | null;
};

export type LastMessageAggregate = {
  id: string;
  type: MessageType;
  content: string | null;
  createdAt: Date;
} | null;

export type RoomAggregate = {
  id: string;
  requestId: string; // 이사 요청 ID
  consumer: RoomParticipant;
  driver: RoomParticipant;
  updatedAt: Date;
  closedAt: Date | null;
  lastMessage: LastMessageAggregate;
};

export interface IChattingRoomsRepository {
  createOrGetRoomByDriver(
    requestId: string,
    consumerId: string,
    driverId: string,
    ctx?: TransactionContext,
  ): Promise<{ roomId: string }>;
  findById(roomId: string, ctx?: TransactionContext): Promise<ChattingRoomEntity | null>;
  findJoinableByUser(userId: string, ctx?: TransactionContext): Promise<RoomAggregate[]>;
  incrementNextSequence(roomId: string, ctx?: TransactionContext): Promise<number>;
}

export const CHATTING_ROOMS_REPOSITORY = 'IChattingRoomsRepository';
