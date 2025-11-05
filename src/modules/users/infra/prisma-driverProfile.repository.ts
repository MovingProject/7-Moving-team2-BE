import {
  DriverAggregate,
  IDriverProfileRepository,
  RepoFindDriversInput,
} from '../interface/driverProfile.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { getDb } from '@/shared/prisma/get-db';
import { CreateDriverProfileBody } from '../dto/createDriverProfileBodySchema';
import { DriverProfileEntity } from '../types';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class PrismaDriverProfileRepository implements IDriverProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDrivers(input: RepoFindDriversInput): Promise<DriverAggregate[]> {
    const { area, type, sortField, cursorPrimary, cursorId, takePlusOne, search } = input;

    const baseWhere: Prisma.DriverProfileWhereInput = {
      deletedAt: null,
      driver: { role: Role.DRIVER, deletedAt: null },
      ...(area ? { driverServiceAreas: { some: { serviceArea: area } } } : {}),
      ...(type ? { driverServiceTypes: { some: { serviceType: type } } } : {}),
      ...(search
        ? {
            nickname: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const where: Prisma.DriverProfileWhereInput =
      cursorPrimary != null && cursorId
        ? {
            AND: [
              baseWhere,
              {
                OR: [
                  { [sortField]: { lt: cursorPrimary } },
                  {
                    AND: [{ [sortField]: cursorPrimary }, { userId: { lt: cursorId } }],
                  },
                ],
              },
            ],
          }
        : baseWhere;

    const rows = await this.prisma.driverProfile.findMany({
      where,
      orderBy: [{ [sortField]: 'desc' }, { userId: 'desc' }],
      take: takePlusOne,
      include: {
        driver: { select: { id: true, name: true, role: true, createdAt: true, deletedAt: true } },
        driverServiceAreas: { select: { serviceArea: true } },
        driverServiceTypes: { select: { serviceType: true } },
      },
    });

    return rows;
  }

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
        careerYears: body.careerYears,
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

  async findById(driverId: string, ctx?: TransactionContext): Promise<DriverProfileEntity | null> {
    const db = getDb(ctx, this.prisma);

    return db.driverProfile.findUnique({
      where: { userId: driverId },
      include: {
        driverServiceAreas: true,
        driverServiceTypes: true,
      },
    });
  }
}
