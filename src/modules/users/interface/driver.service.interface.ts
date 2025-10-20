import { AccessTokenPayload } from '@/shared/jwt/jwt.payload.schema';
import { CreateDriverProfileBody } from '../dto/createDriverProfileBodySchema';
import { DriverProfileEntity, userEntity } from '../types';
import { GetDriverListQuery } from '../dto/getDriverListQuerySchema';
import { Area, MoveType } from '@/shared/constant/values';

export interface DriverUserSummary {
  id: userEntity['id'];
  name: userEntity['name'];
  role: userEntity['role'];
  createdAt: userEntity['createdAt'];
}

export interface DriverProfileSummary {
  userId: DriverProfileEntity['userId'];
  image: DriverProfileEntity['image'];
  nickname: DriverProfileEntity['nickname'];
  oneLiner: DriverProfileEntity['oneLiner'];
  careerYears: DriverProfileEntity['careerYears'];
  rating: DriverProfileEntity['rating'];
  reviewCount: DriverProfileEntity['reviewCount'];
  confirmedCount: DriverProfileEntity['confirmedCount'];
  likeCount: DriverProfileEntity['likeCount'];
  serviceAreas: Area[];
  serviceTypes: MoveType[];
}

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
  createDriverProfile(driverId: string, body: CreateDriverProfileBody): Promise<DriverProfileEntity>;
  likeDriver(driverId: string, user: AccessTokenPayload): Promise<LikeDriverResult>;
  unlikeDriver(driverId: string, user: AccessTokenPayload): Promise<UnlikeDriverResult>;
}

export const DRIVER_SERVICE = 'IDriverService';
