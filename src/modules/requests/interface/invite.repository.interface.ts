import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { InviteEntity } from '../types';

export interface IInviteRepository {
  insertIfAbsent(requestId: string, driverId: string, ctx?: TransactionContext): Promise<boolean>;
  findInvitedDriverIds(consumerId: string, driverIds: string[]): Promise<Set<string>>;
  findByRequestAndDriver(requestId: string, driverId: string, ctx?: TransactionContext): Promise<InviteEntity | null>;
}

export const INVITE_REPOSITORY = 'IInviteRepository';
