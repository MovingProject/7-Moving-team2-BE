import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

export interface ILikeRepository {
  insertIfAbsent(consumerId: string, driverId: string, ctx?: TransactionContext): Promise<boolean>;
}

export const LIKE_REPOSITORY = 'ILikeRepository';
