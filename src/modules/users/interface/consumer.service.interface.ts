import { GetLikedDriversQuerySchemaDto } from '../dto/getLikedDriversQuerySchema';
import { driverProfileEntity, userEntity, ConsumerProfileEntity } from '../types';
import { Area, MoveType } from '@/shared/constant/values';
import { CreateConsumerProfileBody } from '../dto/createConsumerProfileBodySchema';

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
