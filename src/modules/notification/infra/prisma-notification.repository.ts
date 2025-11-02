import { PrismaService } from '@/shared/prisma/prisma.service';
import { IPrismaNotificationRepository } from '../interface/notification.repository.interface';
import { Injectable } from '@nestjs/common';
import { CreateNotificationInput, NotificationEntity } from '../types';

@Injectable()
export class PrismaNotificationRepository implements IPrismaNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: payload,
    });
    return notification;
  }
}
