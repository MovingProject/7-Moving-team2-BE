import { PrismaService } from '@/shared/prisma/prisma.service';
import { FindNotificationsArgs, IPrismaNotificationRepository } from '../interface/notification.repository.interface';
import { Injectable } from '@nestjs/common';
import { CreateNotificationInput } from '../types';
import type { NotificationEntity } from '../types';

@Injectable()
export class PrismaNotificationRepository implements IPrismaNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: payload,
    });
    return notification;
  }

  async findManyByUser(args: FindNotificationsArgs): Promise<NotificationEntity[]> {
    const { userId, take, cursor, onlyUnread } = args;

    return this.prisma.notification.findMany({
      where: {
        receiverId: userId,
        ...(onlyUnread && { readAt: null }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      take,
    });
  }
  async findAllByReceiverId(receiverId: string): Promise<NotificationEntity[]> {
    const notification = await this.prisma.notification.findMany({
      where: { receiverId },
      orderBy: { createdAt: 'desc' },
    });
    return notification;
  }

  async findOneById(id: string): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    return notification;
  }

  async markReadByIds(receiverId: string, ids: string[], readAt: Date): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { receiverId, id: { in: ids }, readAt: null },
      data: { readAt },
    });
  }

  async markAllRead(receiverId: string, readAt: Date): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { receiverId, readAt: null },
      data: { readAt },
    });
  }
}
