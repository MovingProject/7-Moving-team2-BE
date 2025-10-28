import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { ChattingRoomEntity } from '../types';

export interface IChattingRoomsRepository {
  createOrGetRoomByDriver(
    requestId: string,
    consumerId: string,
    driverId: string,
    ctx?: TransactionContext,
  ): Promise<{ roomId: string }>;

  findById(roomId: string, ctx?: TransactionContext): Promise<ChattingRoomEntity | null>;
}

export const CHATTING_ROOMS_REPOSITORY = 'IChattingRoomsRepository';
