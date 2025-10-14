import { PrismaService } from '@/shared/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { IInviteRepository } from '../interface/invite.repository.interface';
import { getDb } from '@/shared/prisma/get-db';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';

@Injectable()
export class PrismaInviteRepository implements IInviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async insertIfAbsent(requestId: string, driverId: string, ctx?: TransactionContext): Promise<boolean> {
    const db = getDb(ctx, this.prisma);

    const rows = await db.$queryRaw<{ inserted: number }[]>`
      INSERT INTO "Invite" ("requestId", "driverId")
      VALUES (${requestId}, ${driverId})
      ON CONFLICT ("requestId", "driverId") DO NOTHING
      RETURNING 1 AS inserted
    `;

    return rows.length > 0;
  }
}
