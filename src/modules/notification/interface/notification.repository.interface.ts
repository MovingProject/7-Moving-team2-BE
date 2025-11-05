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
  findAllByReceiverId(receiverId: string): Promise<NotificationEntity[]>;
  findOneById(id: string): Promise<NotificationEntity | null>;
  markReadByIds(receiverId: string, ids: string[], readAt: Date): Promise<void>;
  markAllRead(receiverId: string, readAt: Date): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = 'INotificationRepository';
