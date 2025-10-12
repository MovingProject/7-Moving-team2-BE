import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { Injectable } from '@nestjs/common';
import { ILikeRepository } from '../interface/like.repository.interface';

@Injectable()
export class PrismaLikeRepository implements ILikeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertIfAbsent(consumerId: string, driverId: string, ctx?: TransactionContext): Promise<boolean> {
    const db = getDb(ctx, this.prisma);

    const result = await db.$queryRaw<{ inserted: number }[]>`
      INSERT INTO "LIKE" ("consumerId", "driverId")
      VALUES (${consumerId}, ${driverId})
      ON CONFLICT ("consumerId", "driverId") DO NOTHING
      RETURNING 1 AS inserted
    `;

    return result.length > 0;
  }
}
