import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { CreateDriverProfileBody } from '../dto/createDriverProfileBodySchema';
import { DriverProfileEntity } from '../types';

export interface IDriverProfileRepository {
  createDriverProfile(
    driverId: string,
    body: CreateDriverProfileBody,
    ctx?: TransactionContext,
  ): Promise<DriverProfileEntity>;
  incrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void>;
  decrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void>;
}

export const DRIVER_PROFILE_REPOSITORY = 'IDriverProfileRepository';
