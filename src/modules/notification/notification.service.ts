import { Inject, Injectable } from '@nestjs/common';
import {
  type IPrismaNotificationRepository,
  NOTIFICATION_REPOSITORY,
} from './interface/notification.repository.interface';
import { CreateNotificationInput } from './types';
import { NotificationGateway } from './ws/notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: IPrismaNotificationRepository,
    private readonly gateway: NotificationGateway,
  ) {}

  async createNotification(payload: CreateNotificationInput) {
    const notification = await this.notificationRepository.create(payload);
    this.gateway.sendToUser(payload.receiverId, notification);
  }
}
