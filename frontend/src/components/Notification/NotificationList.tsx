// src/components/NotificationList.tsx
import { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markNotificationAsRead,
} from "../../services/notification/notificationService";
import type { NotificationDto } from "../../services/types/notification";

interface NotificationListProps {
  onUnreadCountChange?: (count: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await fetchMyNotifications();
      setNotifications(data);
      onUnreadCountChange?.(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const updated = await markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      onUnreadCountChange?.(
        notifications.filter((n) => n.id !== id && !n.isRead).length
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (loading) return <div>Loading notifications...</div>;
  if (!notifications.length) return <div>No notifications</div>;

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`p-3 border rounded cursor-pointer flex justify-between items-center ${
            n.isRead ? "bg-gray-100" : "bg-blue-50 font-semibold"
          }`}
          onClick={() => !n.isRead && markAsRead(n.id)}>
          <span>{n.message}</span>
          {!n.isRead && <span className="text-sm text-blue-600">New</span>}
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
