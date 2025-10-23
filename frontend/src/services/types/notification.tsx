// src/types/notification.ts
export interface NotificationDto {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: number;
  reservationId?: number;
}
