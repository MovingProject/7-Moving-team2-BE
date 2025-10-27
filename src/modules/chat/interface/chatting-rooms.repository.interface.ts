import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

export interface IChattingRoomsRepository {
  createOrGetRoomByDriver(
    requestId: string,
    consumerId: string,
    driverId: string,
    ctx?: TransactionContext,
  ): Promise<{ roomId: string }>;
}

export const CHATTING_ROOMS_REPOSITORY = 'IChattingRoomsRepository';
