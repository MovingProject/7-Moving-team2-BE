import { GetLikedDriversQuerySchemaDto } from '../dto/getLikedDriversQuerySchema';
import { DriverProfileEntity, userEntity, ConsumerProfileEntity } from '../types';
import { Area, MoveType } from '@/shared/constant/values';
import { CreateConsumerProfileBody } from '../dto/createConsumerProfileBodySchema';

export interface LikedDriverEntity {
  id: userEntity['id'];
  nickname: DriverProfileEntity['nickname'];
  rating: DriverProfileEntity['rating'];
  reviewCount: DriverProfileEntity['reviewCount'];
  careerYears: DriverProfileEntity['careerYears'];
  confirmedCount: DriverProfileEntity['confirmedCount'];
  likeCount: DriverProfileEntity['likeCount'];
  avatarUrl: DriverProfileEntity['image'];
  serviceAreas: Area[];
  serviceTypes: MoveType[];
  likedAt: Date;
}

export interface GetLikedDriverListResponse {
  likedDriverList: LikedDriverEntity[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface IConsumerService {
  createConsumerProfile(consumerId: string, body: CreateConsumerProfileBody): Promise<ConsumerProfileEntity>;
  getLikedDriverList(consumerId: string, query: GetLikedDriversQuerySchemaDto): Promise<GetLikedDriverListResponse>;
}

export const CONSUMER_SERVICE = 'IConsumerService';
