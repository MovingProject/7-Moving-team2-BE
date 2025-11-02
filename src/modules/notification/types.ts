import { NotificationType } from '@/shared/constant/values';

export type NotificationEntity = {
  id: string;
  receiverId: string;
  senderId?: string | null;
  content: string;
  notificationType: NotificationType;
  createdAt: Date;
  readAt: Date | null;
  requestId?: string | null;
  quotationId?: string | null;
  chattingRoomId?: string | null;
  reviewId?: string | null;
};

export type CreateNotificationInput = {
  receiverId: string;
  notificationType: NotificationType;
  content: string;
  senderId?: string;
  requestId?: string;
  quotationId?: string;
  chattingRoomId?: string;
  reviewId?: string;
};

export type SendNotificationPayload = {
  id: string;
  receiverId: string;
  senderId?: string | null;
  content: string;
  notificationType: NotificationType;
  createdAt: string;
  readAt?: string | null;
  requestId?: string | null;
  quotationId?: string | null;
  chattingRoomId?: string | null;
  reviewId?: string | null;
};
