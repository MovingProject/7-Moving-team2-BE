import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../infra/prisma.service';

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- utilities
  findUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  // --- consumer
  upsertConsumerProfile(data: Prisma.ConsumerProfileUpsertArgs['create'] & Prisma.ConsumerProfileUpsertArgs['update']) {
    // userId UNIQUE → upsert
    return this.prisma.consumerProfile.upsert({
      where: { userId: data.userId as string },
      create: data,
      update: data,
    });
  }

  // --- driver
  upsertDriverProfile(data: Prisma.DriverProfileUpsertArgs['create'] & Prisma.DriverProfileUpsertArgs['update']) {
    return this.prisma.driverProfile.upsert({
      where: { userId: data.userId as string },
      create: data,
      update: data,
      include: { serviceAreas: true, serviceTypes: true },
    });
  }

  createDriverAreasIfAny(driverProfileId: string, areas?: string[]) {
    if (!areas?.length) return Promise.resolve({ count: 0 });
    const rows = areas.map((area) => ({ driverProfileId, area: area as any }));
    return this.prisma.driverServiceArea.createMany({ data: rows, skipDuplicates: true });
  }

  createDriverTypesIfAny(driverProfileId: string, types?: string[]) {
    if (!types?.length) return Promise.resolve({ count: 0 });
    const rows = types.map((serviceType) => ({ driverProfileId, moveType: moveType as any }));
    return this.prisma.driverServiceType.createMany({ data: rows, skipDuplicates: true });
  }

  getDriverProfileFull(id: string) {
    return this.prisma.driverProfile.findUnique({
      where: { id },
      include: { serviceAreas: true, serviceTypes: true },
    });
  }

  // expose prisma for $transaction when needed
  $tx<T>(fn: (tx: PrismaClient) => Promise<T>) {
    return this.prisma.$transaction((tx) => fn(tx as unknown as PrismaClient));
  }
}
