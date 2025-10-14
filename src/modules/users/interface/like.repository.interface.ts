import { Area, MoveType } from '@/shared/constant/values';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { LikedDriversKey } from '@/shared/utils/cursor.helper';
import { DriverProfileEntity, likeEntity, userEntity } from '../types';

export type LikeWithDriverAggregate = likeEntity & {
  driver: userEntity & {
    driverProfile:
      | (Omit<DriverProfileEntity, 'driverServiceAreas' | 'driverServiceTypes'> & {
          driverServiceAreas: { serviceArea: Area }[];
          driverServiceTypes: { serviceType: MoveType }[];
        })
      | null;
  };
};

export interface ILikeRepository {
  insertIfAbsent(consumerId: string, driverId: string, ctx?: TransactionContext): Promise<boolean>;
  deleteIfExists(consumerId: string, driverId: string, ctx?: TransactionContext): Promise<boolean>;
  findLikedDrivers(consumerId: string, take: number, cursor?: LikedDriversKey): Promise<LikeWithDriverAggregate[]>;
}

export const LIKE_REPOSITORY = 'ILikeRepository';
