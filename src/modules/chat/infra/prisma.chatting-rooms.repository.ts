import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import { IChattingRoomsRepository } from '../interface/chatting-rooms.repository.interface';

export class PrismaChattingRoomsRepository implements IChattingRoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOrGetRoomByDriver(
    requestId: string,
    consumerId: string,
    driverId: string,
    ctx?: TransactionContext,
  ): Promise<{ roomId: string }> {
    const db = getDb(ctx, this.prisma);

    const room = await db.chattingRoom.upsert({
      where: { requestId_driverId: { requestId, driverId } },
      create: { requestId, consumerId, driverId },
      update: {},
      select: { id: true },
    });

    return { roomId: room.id };
  }
}
