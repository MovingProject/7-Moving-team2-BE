import { GetLikedDriversQuerySchemaDto } from '../dto/getLikedDriversQuerySchema';
import { driverProfileEntity, userEntity } from '../types';
import { Area, MoveType } from '@/shared/constant/values';

export interface LikedDriverEntity {
  id: userEntity['id'];
  nickname: driverProfileEntity['nickname'];
  rating: driverProfileEntity['rating'];
  reviewCount: driverProfileEntity['reviewCount'];
  careerYears: driverProfileEntity['careerYears'];
  confirmedCount: driverProfileEntity['confirmedCount'];
  likeCount: driverProfileEntity['likeCount'];
  avatarUrl: driverProfileEntity['image'];
  serviceAreas: Area[];
  serviceTypes: MoveType[];
  likedAt: Date;
}

export interface getLikedDriverListResponse {
  likedDriverList: LikedDriverEntity[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface IConsumerService {
  getLikedDriverList(consumerId: string, query: GetLikedDriversQuerySchemaDto): Promise<getLikedDriverListResponse>;
}

export const CONSUMER_SERVICE = 'IConsumerService';
