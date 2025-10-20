import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { SortField } from '../domain/driver-sort.helper';
import { CreateDriverProfileBody } from '../dto/createDriverProfileBodySchema';
import { GetDriverListQuery } from '../dto/getDriverListQuerySchema';
import { DriverProfileEntity } from '../types';
import { Area, MoveType, Role } from '@prisma/client';

export type RepoFindDriversInput = {
  area?: GetDriverListQuery['area'];
  type?: GetDriverListQuery['type'];
  sortField: SortField;
  cursorPrimary?: number;
  cursorId?: string;
  takePlusOne: number;
};

export interface DriverAggregate {
  id: string;
  userId: string;
  image: string | null;
  nickname: string;
  oneLiner: string;
  careerYears: number;
  description: string;
  likeCount: number;
  rating: number;
  reviewCount: number;
  confirmedCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  driver: {
    id: string;
    name: string;
    role: Role;
    deletedAt: Date | null;
    createdAt: Date;
  };

  driverServiceAreas: Array<{ serviceArea: Area }>;
  driverServiceTypes: Array<{ serviceType: MoveType }>;
}

export interface IDriverProfileRepository {
  createDriverProfile(
    driverId: string,
    body: CreateDriverProfileBody,
    ctx?: TransactionContext,
  ): Promise<DriverProfileEntity>;
  incrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void>;
  decrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void>;
  findDrivers(input: RepoFindDriversInput): Promise<DriverAggregate[]>;
}

export const DRIVER_PROFILE_REPOSITORY = 'IDriverProfileRepository';
