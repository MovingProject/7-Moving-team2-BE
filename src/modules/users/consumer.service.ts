import { NotFoundException } from '@/shared/exceptions';
import { decodeLikedDriverCursor, encodeLikedDriverCursor, LikedDriversKey } from '@/shared/utils/cursor.helper';
import { Inject } from '@nestjs/common';
import { GetLikedDriversQuerySchemaDto } from './dto/getLikedDriversQuerySchema';
import { LikedDriverEntity } from './interface/consumer.service.interface';
import { LIKE_REPOSITORY, type ILikeRepository } from './interface/like.repository.interface';
import { USER_REPOSITORY, type IUserRepository } from './interface/users.repository.interface';

export class ConsumerService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(LIKE_REPOSITORY)
    private readonly likeRepository: ILikeRepository,
  ) {}

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
