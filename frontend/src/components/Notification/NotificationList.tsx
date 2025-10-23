// src/components/NotificationList.tsx
import { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markNotificationAsRead,
} from "../../services/notification/notificationService";
import type { NotificationDto } from "../../services/types/notification";
import { HiBell } from "react-icons/hi";

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
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <HiBell className="mr-2 text-yellow-600" /> Thông báo
      </h2>
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
    </div>
  );
};

export default NotificationList;
