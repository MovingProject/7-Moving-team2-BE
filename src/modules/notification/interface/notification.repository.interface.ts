import { CreateNotificationInput } from '../types';
import { NotificationEntity } from '../types';

export interface IPrismaNotificationRepository {
  create(payload: CreateNotificationInput): Promise<NotificationEntity>;
}

export const NOTIFICATION_REPOSITORY = 'INotificationRepository';
