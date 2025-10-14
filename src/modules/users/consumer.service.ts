import { ConflictException, NotFoundException } from '@/shared/exceptions';
import { decodeLikedDriverCursor, encodeLikedDriverCursor, LikedDriversKey } from '@/shared/utils/cursor.helper';
import { Inject, Injectable } from '@nestjs/common';
import { GetLikedDriversQuerySchemaDto } from './dto/getLikedDriversQuerySchema';
import { LikedDriverEntity } from './interface/consumer.service.interface';
import { LIKE_REPOSITORY, type ILikeRepository } from './interface/like.repository.interface';
import { USER_REPOSITORY, type IUserRepository } from './interface/users.repository.interface';
import { CreateConsumerProfileBody } from './dto/createConsumerProfileBodySchema';
import {
  CONSUMER_PROFILE_REPOSITORY,
  type IConsumerProfileRepository,
} from './interface/consumerProfile.repository.interface';

@Injectable()
export class ConsumerService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepository: ILikeRepository,
    @Inject(CONSUMER_PROFILE_REPOSITORY)
    private readonly consumerProfileRepository: IConsumerProfileRepository,
  ) {}

  async createConsumerProfile(consumerId: string, body: CreateConsumerProfileBody) {
    const existingConsumer = await this.userRepository.findById(consumerId);

    if (!existingConsumer) {
      throw new NotFoundException('Consumer not found');
    }

    if (existingConsumer.consumerProfile) {
      throw new ConflictException('이미 등록된 프로필입니다.');
    }

    try {
      return await this.consumerProfileRepository.createConsumerProfile(consumerId, body);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const prismaError = error as { code?: string };
        if (prismaError.code === 'P2002') {
          throw new ConflictException('이미 등록된 프로필입니다.');
        }
      }
      throw error;
    }
  }

  async getLikedDriverList(consumerId: string, query: GetLikedDriversQuerySchemaDto) {
    const existingConsumer = await this.userRepository.findById(consumerId);

    if (!existingConsumer) {
      throw new NotFoundException('Consumer not found');
    }

    const rawLimit = query.limit ?? 10;
    const limit = Math.max(1, Math.min(50, rawLimit));
    const take = limit + 1;

    let lastKey: LikedDriversKey | undefined = undefined;

    if (query.cursor) {
      const decoded = decodeLikedDriverCursor(query.cursor);
      lastKey = { likedAt: new Date(decoded.likedAt), id: decoded.id };
    }

    const rows = await this.likeRepository.findLikedDrivers(consumerId, take, lastKey);

    const hasNext = rows.length > limit;
    const items = hasNext ? rows.slice(0, limit) : rows;

    const nextCursor =
      hasNext && items.length
        ? encodeLikedDriverCursor({
            likedAt: items[items.length - 1].likedAt.toISOString(),
            id: items[items.length - 1].id,
          })
        : null;

    const likedDriverList: LikedDriverEntity[] = items.map((like) => {
      const p = like.driver.driverProfile;
      return {
        id: like.driver.id,
        nickname: p?.nickname ?? '',
        rating: p?.rating ?? 0,
        reviewCount: p?.reviewCount ?? 0,
        careerYears: p?.careerYears ?? '',
        confirmedCount: p?.confirmedCount ?? 0,
        likeCount: p?.likeCount ?? 0,
        avatarUrl: p?.image ?? null,
        serviceAreas: p?.driverServiceAreas.map((a) => a.serviceArea) ?? [],
        serviceTypes: p?.driverServiceTypes.map((t) => t.serviceType) ?? [],
        likedAt: like.likedAt,
      };
    });

    return { likedDriverList, nextCursor, hasNext };
  }
}
