// src/services/notificationService.ts
import api from "../../api/axios";
import type { NotificationDto } from "../types/notification";

// Lấy danh sách thông báo của user hiện tại
export const fetchMyNotifications = async (): Promise<NotificationDto[]> => {
  try {
    const response = await api.get("/notifications"); // endpoint backend
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
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
