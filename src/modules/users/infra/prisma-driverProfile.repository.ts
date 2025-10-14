import { IDriverProfileRepository } from '../interface/driverProfile.repository.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { getDb } from '@/shared/prisma/get-db';

@Injectable()
export class PrismaDriverProfileRepository implements IDriverProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

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
