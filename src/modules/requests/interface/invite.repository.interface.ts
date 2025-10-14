import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

export interface IInviteRepository {
  insertIfAbsent(requestId: string, driverId: string, ctx?: TransactionContext): Promise<boolean>;
}

export const INVITE_REPOSITORY = 'IInviteRepository';
