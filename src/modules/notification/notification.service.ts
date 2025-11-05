import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IUserRepository } from '../users/interface/users.repository.interface';
import { USER_REPOSITORY } from '../users/interface/users.repository.interface';
import { GetNotificationsQuery } from './interface/dto/get-notifications.dto';
import {
  type IPrismaNotificationRepository,
  NOTIFICATION_REPOSITORY,
} from './interface/notification.repository.interface';
import { GetNotificationsResult, INotificationService } from './interface/notification.service.interface';
import { CreateNotificationInput } from './types';
import { NotificationGateway } from './ws/notification.gateway';

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IPrismaNotificationRepository,
    private readonly gateway: NotificationGateway,
  ) {}

  async createNotification(payload: CreateNotificationInput) {
    const notification = await this.notificationRepository.create(payload);
    this.gateway.sendToUser(payload.receiverId, notification);
  }

  async getNotifications(userId: string, input: GetNotificationsQuery): Promise<GetNotificationsResult> {
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    const { limit, cursor } = input;
    const take = Number(limit) + 1;

    const notifications = await this.notificationRepository.findManyByUser({
      userId,
      take,
      cursor,
      onlyUnread: true,
    });

    const hasNext = notifications.length === take;
    const items = hasNext ? notifications.slice(0, Number(limit)) : notifications;
    const nextCursor = hasNext && items.length > 0 ? items[items.length - 1].id : null;

    return {
      items,
      nextCursor,
      hasNext,
    };
  }
}
