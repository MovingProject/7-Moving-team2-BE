import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

export interface IDriverProfileRepository {
  incrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void>;
  decrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void>;
}

export const DRIVER_PROFILE_REPOSITORY = 'IDriverProfileRepository';
