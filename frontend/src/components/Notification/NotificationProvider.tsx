import { useState } from "react";
import type { ReactNode } from "react";
import { Toast } from "flowbite-react";
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
              ${n.type === "success" && "!bg-green-400 !text-green-900"}
              ${n.type === "error" && "!bg-red-400 !text-red-900"}
              ${n.type === "warning" && "!bg-yellow-400 !text-yellow-900"}
              ${n.type === "info" && "!bg-blue-400 !text-blue-900"}
            `}>
            {getIcon(n.type)}
            <div className="ml-3 text-sm font-normal">{n.message}</div>
          </Toast>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
