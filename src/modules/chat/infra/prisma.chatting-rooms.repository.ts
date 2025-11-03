import { getDb } from '@/shared/prisma/get-db';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TransactionContext } from '@/shared/prisma/transaction-runner.interface';
import {
  IChattingRoomsRepository,
  RoomAggregate,
  RoomParticipant,
} from '../interface/chatting-rooms.repository.interface';
import { Injectable } from '@nestjs/common';
import { MessageType } from '@/shared/constant/values';

@Injectable()
export class PrismaChattingRoomsRepository implements IChattingRoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(roomId: string, ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);
    return db.chattingRoom.findUnique({
      where: { id: roomId },
    });
  }

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

  async findJoinableByUser(userId: string, ctx?: TransactionContext) {
    const db = getDb(ctx, this.prisma);
    const rows = await db.chattingRoom.findMany({
      where: {
        deletedAt: null,
        closedAt: null,
        OR: [{ consumerId: userId }, { driverId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        consumer: {
          select: {
            id: true,
            role: true,
            name: true,
            consumerProfile: { select: { image: true } },
          },
        },
        driver: {
          select: {
            id: true,
            role: true,
            name: true,
            driverProfile: { select: { nickname: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            messageType: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    const toParticipant = (u: {
      id: string;
      role: 'CONSUMER' | 'DRIVER';
      name: string;
      consumerProfile?: { image: string | null } | null;
      driverProfile?: { nickname: string | null; image: string | null } | null;
    }): RoomParticipant => ({
      id: u.id,
      role: u.role,
      name: u.name,
      avatarUrl: u.role === 'DRIVER' ? (u.driverProfile?.image ?? null) : (u.consumerProfile?.image ?? null),
      nickname: u.role === 'DRIVER' ? (u.driverProfile?.nickname ?? null) : null,
    });

    return rows.map<RoomAggregate>((r) => {
      const m = r.messages[0];
      return {
        id: r.id,
        consumer: toParticipant(r.consumer),
        driver: toParticipant(r.driver),
        updatedAt: r.updatedAt,
        closedAt: r.closedAt,
        lastMessage: m
          ? {
              id: m.id,
              type: m.messageType as MessageType,
              content: m.content ?? null,
              createdAt: m.createdAt,
            }
          : null,
      };
    });
  }

  async incrementNextSequence(roomId: string, ctx?: TransactionContext): Promise<number> {
    const db = getDb(ctx, this.prisma);
    const room = await db.chattingRoom.update({
      where: { id: roomId },
      data: { nextSequence: { increment: 1 } },
      select: { nextSequence: true },
    });
    return room.nextSequence;
  }
}
