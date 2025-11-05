import { CreateNotificationInput, NotificationEntity } from '../types';

export interface FindNotificationsArgs {
  userId: string;
  take: number;
  cursor?: string;
  onlyUnread?: boolean;
}

export interface IPrismaNotificationRepository {
  create(payload: CreateNotificationInput): Promise<NotificationEntity>;
  findManyByUser(args: FindNotificationsArgs): Promise<NotificationEntity[]>;
}

export const NOTIFICATION_REPOSITORY = 'INotificationRepository';
