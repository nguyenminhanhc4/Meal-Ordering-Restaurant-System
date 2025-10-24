import { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markNotificationAsRead,
} from "../../services/notification/notificationService";
import type { NotificationDto } from "../../services/types/notification";
import {
  HiBell,
  HiCheckCircle,
  HiXCircle,
  HiTruck,
  HiShoppingCart,
  HiCalendar,
  HiInformationCircle,
  HiSparkles,
  HiArchive,
} from "react-icons/hi";
import { useRealtimeMessage } from "../../api/useRealtimeUpdate";
import { useAuth } from "../../store/AuthContext";

interface NotificationListProps {
  onUnreadCountChange?: (count: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onUnreadCountChange,
}) => {
  const { user } = useAuth();
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

  useRealtimeMessage<{ type: string; data: NotificationDto }>(
    user ? `/topic/notifications/${user.publicId}` : "",
    (msg) => {
      if (msg.type === "NEW_NOTIFICATION") {
        const newNoti = msg.data;
        setNotifications((prev) => [newNoti, ...prev]);
        onUnreadCountChange?.(
          (notifications.filter((n) => !n.isRead).length ?? 0) + 1
        );
      }
    }
  );

  useRealtimeMessage<{ type: string; data: NotificationDto }>(
    "/topic/admin/notifications",
    (msg) => {
      if (msg.type === "NEW_NOTIFICATION") {
        const newNoti = msg.data;
        setNotifications((prev) => [newNoti, ...prev]);
      }
    }
  );

  // 🎨 Style và icon cho từng loại typeName (tiếng Việt)
  const typeStyles: Record<
    string,
    { bg: string; border: string; icon: React.ReactNode }
  > = {
    // --- ORDER ---
    "Đơn hàng mới": {
      bg: "bg-blue-50",
      border: "border-blue-500",
      icon: <HiShoppingCart className="text-blue-600" />,
    },
    "Đơn hàng được duyệt": {
      bg: "bg-emerald-50",
      border: "border-emerald-600",
      icon: <HiCheckCircle className="text-emerald-700" />,
    },
    "Đơn hàng đang giao": {
      bg: "bg-amber-50",
      border: "border-amber-500",
      icon: <HiTruck className="text-amber-600" />,
    },
    "Đơn hàng đã giao": {
      bg: "bg-cyan-50",
      border: "border-cyan-600",
      icon: <HiArchive className="text-cyan-700" />,
    },
    "Đơn hàng bị hủy": {
      bg: "bg-rose-50",
      border: "border-rose-600",
      icon: <HiXCircle className="text-rose-700" />,
    },

    // --- RESERVATION ---
    "Đặt bàn mới": {
      bg: "bg-purple-50",
      border: "border-purple-500",
      icon: <HiCalendar className="text-purple-600" />,
    },
    "Đặt bàn được duyệt": {
      bg: "bg-lime-50",
      border: "border-lime-600",
      icon: <HiCheckCircle className="text-lime-700" />,
    },
    "Hoàn tất đặt bàn": {
      bg: "bg-indigo-50",
      border: "border-indigo-600",
      icon: <HiSparkles className="text-indigo-700" />,
    },
    "Đặt bàn bị hủy": {
      bg: "bg-red-50",
      border: "border-red-600",
      icon: <HiXCircle className="text-red-700" />,
    },
  };

  if (loading)
    return <div className="text-gray-600">Đang tải thông báo...</div>;
  if (!notifications.length) return <div>Không có thông báo nào</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <HiBell className="mr-2 text-yellow-600" /> Thông báo
      </h2>

      <div className="space-y-3">
        {notifications.map((n) => {
          const style = typeStyles[n.typeName] || {
            bg: "bg-gray-50",
            border: "border-gray-300",
            icon: <HiInformationCircle className="text-gray-500" />,
          };

          const isUnread = !n.isRead;

          return (
            <div
              key={n.id}
              onClick={() => isUnread && markAsRead(n.id)}
              className={`relative p-4 rounded-xl flex justify-between items-center cursor-pointer transition duration-150 ${
                isUnread
                  ? `border-l-4 ${style.border} ${style.bg} hover:shadow-lg hover:scale-[1.01]`
                  : `border border-gray-200 bg-gray-50`
              }`}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{style.icon}</div>

                <div className="flex flex-col">
                  <span
                    className={`${
                      isUnread
                        ? "font-semibold text-gray-900"
                        : "text-gray-600 font-normal"
                    }`}>
                    {n.message}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* 🔴 Chấm đỏ hiển thị rõ cho chưa đọc */}
              {isUnread && (
                <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationList;
