import React, { useEffect, useState } from "react";
import { Button, Badge } from "flowbite-react";
import { HiOutlineBell } from "react-icons/hi";
import { useAuth } from "../../store/AuthContext";
import { fetchUnreadNotificationCount } from "../../services/notification/notificationService";
import type { NotificationDto } from "../../services/types/notification";
import { useRealtimeMessage } from "../../api/useRealtimeUpdate";
import { useNavigate } from "react-router-dom";

interface NotificationBellProps {
  bgColor?: string;
  hoverColor?: string;
  iconColor?: string;
  badgeColor?: "failure" | "success" | "warning" | "info" | "indigo";
  redirectTo?: string; // 👈 Thêm prop này
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  bgColor = "!bg-stone-700",
  hoverColor = "hover:!bg-stone-600",
  iconColor = "text-yellow-400",
  badgeColor = "failure",
  redirectTo = "/profile?tab=notifications", // 👈 Giá trị mặc định
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadNotificationCount()
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0));
    }
  }, [user]);

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

  // ✅ Khi bấm chuông → chuyển hướng linh động
  const handleClick = () => {
    navigate(redirectTo);
  };

  return (
    <Button
      color="gray"
      className={`${bgColor} ${hoverColor} rounded-full p-2 relative`}
      onClick={handleClick}>
      <HiOutlineBell className={`w-6 h-6 ${iconColor}`} />
      {unreadCount > 0 && (
        <Badge
          color={badgeColor}
          size="sm"
          className="absolute -top-1 -right-1 !p-0.5 !h-4 !w-4 flex items-center justify-center text-xs">
          {unreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
