import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { LikedDriversKey } from '@/shared/utils/cursor.helper';
import { Injectable } from '@nestjs/common';
import { ILikeRepository, LikeWithDriverAggregate } from '../interface/like.repository.interface';
import { Area, MoveType } from '@shared/constant/values';
@Injectable()
export class PrismaLikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertIfAbsent(consumerId: string, driverId: string, ctx?: TransactionContext): Promise<boolean> {
    const db = getDb(ctx, this.prisma);

    const result = await db.$queryRaw<{ inserted: number }[]>`
      INSERT INTO "Like" ("consumerId", "driverId")
      VALUES (${consumerId}, ${driverId})
      ON CONFLICT ("consumerId", "driverId") DO NOTHING
      RETURNING 1 AS inserted
    `;

    return result.length > 0;
  }

  async deleteIfExists(consumerId: string, driverId: string, ctx?: TransactionContext): Promise<boolean> {
    const db = getDb(ctx, this.prisma);

    const result = await db.$queryRaw<{ deleted: number }[]>`
      DELETE FROM "Like" WHERE "consumerId" = ${consumerId} AND "driverId" = ${driverId}
      RETURNING 1 AS deleted
    `;

    return result.length > 0;
  }

  async findLikedDrivers(
    consumerId: string,
    take: number,
    cursor?: LikedDriversKey,
  ): Promise<LikeWithDriverAggregate[]> {
    const likes = await this.prisma.like.findMany({
      where: { consumerId },
      include: {
        driver: {
          include: {
            driverProfile: {
              include: {
                driverServiceAreas: {
                  select: { serviceArea: true },
                },
                driverServiceTypes: {
                  select: { serviceType: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ likedAt: 'desc' }, { id: 'desc' }],
      take,
      ...(cursor && {
        cursor: {
          likedAt_id: {
            likedAt: cursor.likedAt,
            id: cursor.id,
          },
        },
        skip: 1,
      }),
    });

    const mapServiceAreas = (a: { serviceArea: string }): { serviceArea: Area } => ({
      serviceArea: a.serviceArea as Area,
    });

    const mapServiceTypes = (t: { serviceType: string }): { serviceType: MoveType } => ({
      serviceType: t.serviceType as MoveType,
    });

    return likes.map((like) => ({
      ...like,
      driver: {
        ...like.driver,
        driverProfile: like.driver.driverProfile
          ? {
              ...like.driver.driverProfile,
              driverServiceAreas: like.driver.driverProfile.driverServiceAreas.map(mapServiceAreas),
              driverServiceTypes: like.driver.driverProfile.driverServiceTypes.map(mapServiceTypes),
            }
          : null,
      },
    }));
  }
}
