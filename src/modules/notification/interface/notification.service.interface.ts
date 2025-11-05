import { CreateNotificationInput, NotificationEntity } from '../types';
import { GetNotificationsQuery } from './dto/get-notifications.dto';

export interface GetNotificationsResult {
  items: NotificationEntity[];
  nextCursor: string | null;
  hasNext: boolean;
}

export interface INotificationService {
  createNotification(payload: CreateNotificationInput): Promise<void>;
  getNotifications(userId: string, input: GetNotificationsQuery): Promise<GetNotificationsResult>;
}

export const NOTIFICATION_SERVICE = 'INotificationService';
