import { IDriverProfileRepository } from '../interface/driverProfile.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { getDb } from '@/shared/prisma/get-db';
import { CreateDriverProfileBody } from '../dto/createDriverProfileBodySchema';
import { DriverProfileEntity } from '../types';

@Injectable()
export class PrismaDriverProfileRepository implements IDriverProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createDriverProfile(
    driverId: string,
    body: CreateDriverProfileBody,
    ctx?: TransactionContext,
  ): Promise<DriverProfileEntity> {
    const db = getDb(ctx, this.prisma);

    return await db.driverProfile.create({
      data: {
        userId: driverId,
        image: body.image ?? null,
        nickname: body.nickname,
        careerYears: String(body.careerYears), // Prisma 스키마가 String이므로 변환
        oneLiner: body.oneLiner,
        description: body.description,
        driverServiceAreas: {
          create: body.serviceAreas.map((a) => ({ serviceArea: a })),
        },
        driverServiceTypes: {
          create: body.serviceTypes.map((t) => ({ serviceType: t })),
        },
      },

      include: {
        driverServiceAreas: true,
        driverServiceTypes: true,
      },
    });
  }

  async incrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void> {
    const db = getDb(ctx, this.prisma);

    await db.driverProfile.update({
      where: { userId: driverId },
      data: { likeCount: { increment: 1 } },
    });
  }

  async decrementLikeCount(driverId: string, ctx?: TransactionContext): Promise<void> {
    const db = getDb(ctx, this.prisma);

    await db.driverProfile.update({
      where: { userId: driverId },
      data: { likeCount: { decrement: 1 } },
    });
  }
}
