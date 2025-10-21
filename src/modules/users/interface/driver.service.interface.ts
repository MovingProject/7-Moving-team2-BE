import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateDriverProfileBody } from '../dto/createDriverProfileBodySchema';
import { GetDriverListQuery } from '../dto/getDriverListQuerySchema';
import { DriverProfileEntity, userEntity } from '../types';
import { Area, MoveType } from '@shared/constant/values';

export interface DriverUserSummary {
  id: userEntity['id'];
  name: userEntity['name'];
  role: userEntity['role'];
  createdAt: userEntity['createdAt'];
}

export type PublicDriverProfile = Omit<
  DriverProfileEntity,
  'createdAt' | 'updatedAt' | 'deletedAt' | 'driverServiceAreas' | 'driverServiceTypes'
> & {
  serviceAreas: Area[];
  serviceTypes: MoveType[];
};

export type DriverProfileDetail = PublicDriverProfile & {
  isInvitedByMe: boolean;
};

export type DriverProfileSummary = Omit<PublicDriverProfile, 'id' | 'description'> & {};

export interface DriverListItem {
  user: DriverUserSummary;
  profile: DriverProfileSummary;
  isInvitedByMe: boolean;
}

export interface GetDriverListResponse {
  items: DriverListItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

type LikeDriverResult = { liked: true } | { liked: false; message: 'Already liked' };
type UnlikeDriverResult = { unliked: true } | { unliked: false; message: 'Already unliked' };

export interface IDriverService {
  getDrivers(user: AccessTokenPayload | null, query: GetDriverListQuery): Promise<GetDriverListResponse>;
  getDriverProfile(driverId: string, user: AccessTokenPayload | null): Promise<DriverProfileDetail>;
  createDriverProfile(driverId: string, body: CreateDriverProfileBody): Promise<DriverProfileEntity>;
  likeDriver(driverId: string, user: AccessTokenPayload): Promise<LikeDriverResult>;
  unlikeDriver(driverId: string, user: AccessTokenPayload): Promise<UnlikeDriverResult>;
}

export const DRIVER_SERVICE = 'IDriverService';
