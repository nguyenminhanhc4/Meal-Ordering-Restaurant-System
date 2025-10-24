// src/services/notificationService.ts
import api from "../../api/axios";
import type { NotificationDto } from "../types/notification";
import type { Page } from "../types/PageType";

/**
 * Lấy danh sách thông báo có phân trang
 */
export const fetchMyNotifications = async (
  page = 0,
  size = 10
): Promise<Page<NotificationDto> | null> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await api.get<Page<NotificationDto>>(
      `/notifications?${params.toString()}`
    );
    console.log("Noti", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return null;
  }
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (
  id: number
): Promise<NotificationDto> => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const fetchUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get<{ count: number }>(
    "/notifications/unread-count"
  );
  return response.data.count;
};
