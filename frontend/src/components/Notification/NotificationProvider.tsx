import { useState } from "react";
import type { ReactNode } from "react";
import { Toast, Button } from "flowbite-react";
import { HiCheck, HiExclamation, HiInformationCircle } from "react-icons/hi";
import type { Notification, NotificationType } from "./NotificationContext";
import { NotificationContext } from "./NotificationContext";

let idCounter = 0;

export default function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (type: NotificationType, message: string) => {
    const id = ++idCounter;
    setNotifications((prev) => [...prev, { id, type, message }]);

    // Tự động ẩn sau 3s
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <HiCheck className="h-5 w-5 text-green-900" />;
      case "error":
        return <HiExclamation className="h-5 w-5 text-red-900" />;
      case "warning":
        return <HiExclamation className="h-5 w-5 text-yellow-900" />;
      default:
        return <HiInformationCircle className="h-5 w-5 text-blue-900" />;
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* Toast container fixed góc phải */}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-50">
        {notifications.map((n) => (
          <Toast
            key={n.id}
            className={`
        flex items-center p-4 rounded-lg shadow-md border
        ${n.type === "success" && "!border-green-400 !bg-white !text-green-700"}
        ${n.type === "error" && "!border-red-400 !bg-white !text-red-700"}
        ${
          n.type === "warning" &&
          "!border-yellow-400 !bg-white !text-yellow-700"
        }
        ${n.type === "info" && "!border-blue-400 !bg-white text-1blue-700"}
      `}>
            {/* Icon theo loại */}
            <div className="flex-shrink-0">{getIcon(n.type)}</div>

            {/* Nội dung */}
            <div className="ml-3 text-sm font-medium flex-1">{n.message}</div>

            {/* Nút đóng */}
            <Button
              onClick={() => removeNotification(n.id)}
              className="ml-2 text-gray-400 hover:text-gray-600">
              ✕
            </Button>
          </Toast>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
