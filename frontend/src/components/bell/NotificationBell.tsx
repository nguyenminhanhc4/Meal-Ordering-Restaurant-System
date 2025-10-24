import React, { useEffect, useState } from "react";
import { Button, Badge } from "flowbite-react";
import { HiOutlineBell } from "react-icons/hi";
import { useAuth } from "../../store/AuthContext";
import { useNotification } from "../Notification/NotificationContext";
import { fetchMyNotifications } from "../../services/notification/notificationService";
import type { NotificationDto } from "../../services/types/notification";
import { useRealtimeMessage } from "../../api/useRealtimeUpdate";
import { useNavigate } from "react-router-dom";

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Lấy danh sách noti ban đầu
  useEffect(() => {
    if (user) {
      fetchMyNotifications()
        .then((data) => {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        })
        .catch((err) => {
          console.error("Error loading notifications:", err);
          notify("error", "Không thể tải danh sách thông báo!");
        });
    }
  }, [user, notify]);

  // ✅ Nhận realtime từ BE
  useRealtimeMessage<{ type: string; data: NotificationDto }>(
    user ? `/topic/notifications/${user.publicId}` : "",
    (msg) => {
      switch (msg.type) {
        case "NEW_NOTIFICATION": {
          const newNoti = msg.data;
          setNotifications((prev) => [newNoti, ...prev]);
          setUnreadCount((prev) => prev + 1);
          break;
        }
        case "NOTIFICATION_READ": {
          const updated = msg.data;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? { ...n, isRead: true } : n))
          );
          setUnreadCount((prev) => Math.max(prev - 1, 0));
          break;
        }
      }
    }
  );

  // ✅ Khi bấm chuông → chuyển sang trang profile tab thông báo
  const handleClick = () => {
    navigate("/profile?tab=notifications");
  };

  return (
    <Button
      color="gray"
      className="!bg-stone-700 hover:!bg-stone-600 rounded-full p-2 relative"
      onClick={handleClick}>
      <HiOutlineBell className="w-6 h-6 text-yellow-400" />
      {unreadCount > 0 && (
        <Badge
          color="failure"
          size="sm"
          className="absolute -top-1 -right-1 !p-0.5 !h-4 !w-4 flex items-center justify-center text-xs">
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
