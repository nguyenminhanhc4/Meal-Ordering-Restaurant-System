import { useEffect, useState } from "react";
import {
  fetchMyNotifications,
  markNotificationAsRead,
  deleteNotifications,
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
import Pagination from "../../components/common/PaginationClient";
import { Checkbox, Button } from "flowbite-react";
import { useNotification } from "../Notification/NotificationContext";
import ConfirmDialog from "../common/ConfirmDialog";

interface NotificationListProps {
  onUnreadCountChange?: (count: number) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  onUnreadCountChange,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧭 Paging
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // 🗑️ Checkbox chọn xóa
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // ✅ Modal confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTargetIds, setDeleteTargetIds] = useState<number[]>([]);

  const { notify } = useNotification();

  useEffect(() => {
    if (user) loadNotifications(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  const loadNotifications = async (pageNum: number) => {
    try {
      setLoading(true);
      const pageData = await fetchMyNotifications(pageNum, size);
      const list = pageData?.content ?? [];
      setNotifications(list);
      setTotalPages(pageData?.totalPages ?? 0);
      onUnreadCountChange?.(list.filter((n) => !n.isRead).length);
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

  // 🔔 Realtime cập nhật
  useRealtimeMessage<
    | { type: "NEW_NOTIFICATION" | "NOTIFICATION_READ"; data: NotificationDto }
    | { type: "NOTIFICATION_DELETED"; data: number | number[] }
  >(user ? `/topic/notifications/${user.publicId}` : "", (msg) => {
    if (msg.type === "NEW_NOTIFICATION") {
      const newNoti = msg.data as NotificationDto;
      setNotifications((prev) => [newNoti, ...prev]);
      onUnreadCountChange?.(
        (notifications.filter((n) => !n.isRead).length ?? 0) + 1
      );
    } else if (msg.type === "NOTIFICATION_DELETED") {
      const deletedIds = Array.isArray(msg.data) ? msg.data : [msg.data];
      setNotifications((prev) =>
        prev.filter((n) => !deletedIds.includes(n.id))
      );
    } else if (msg.type === "NOTIFICATION_READ") {
      const updated = msg.data as NotificationDto;
      setNotifications((prev) =>
        prev.map((n) => (n.id === updated.id ? updated : n))
      );
    }
  });

  const typeStyles: Record<
    string,
    { bg: string; border: string; icon: React.ReactNode }
  > = {
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

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) setSelectedIds([]);
    else setSelectedIds(notifications.map((n) => n.id));
    setSelectAll(!selectAll);
  };

  // Mở modal confirm xóa
  const showDeleteConfirm = (ids: number[]) => {
    setDeleteTargetIds(ids);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteNotifications(deleteTargetIds);
      setNotifications((prev) =>
        prev.filter((n) => !deleteTargetIds.includes(n.id))
      );
      setSelectedIds((prev) =>
        prev.filter((id) => !deleteTargetIds.includes(id))
      );
      notify("success", "Đã xóa thông báo!");

      if (notifications.length === deleteTargetIds.length && page > 0) {
        setPage(0);
      }
    } catch (err) {
      console.error("Xóa thất bại", err);
      notify("error", "Xóa thất bại!");
    } finally {
      setConfirmOpen(false);
      setDeleteTargetIds([]);
    }
  };

  if (loading)
    return <div className="text-gray-600">Đang tải thông báo...</div>;
  if (!notifications.length)
    return (
      <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-800">
        <div className="text-center text-gray-500 py-10">
          Không có thông báo nào
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center">
          <HiBell className="mr-2 text-yellow-600" /> Thông báo
        </h2>
        <div className="flex items-center gap-2">
          {selectMode && (
            <>
              <Checkbox
                checked={selectAll}
                onChange={toggleSelectAll}
                className="!bg-white"
              />
              <Button
                size="sm"
                color="red"
                onClick={() => showDeleteConfirm(selectedIds)}>
                Xóa
              </Button>
            </>
          )}
          <Button
            size="sm"
            color="red"
            onClick={() => setSelectMode(!selectMode)}>
            {selectMode ? "Hủy chọn" : "Xóa nhiều"}
          </Button>
        </div>
      </div>

      {/* List notification */}
      <div className="space-y-3">
        {notifications.map((n) => {
          const style = typeStyles[n.typeName] || {
            bg: "bg-gray-50",
            border: "border-gray-300",
            icon: <HiInformationCircle className="text-gray-500" />,
          };
          const isUnread = !n.isRead;
          const isSelected = selectedIds.includes(n.id);

          return (
            <div
              key={n.id}
              className={`relative p-4 rounded-xl flex justify-between items-center transition duration-150
              ${
                isUnread
                  ? `border-l-4 ${style.border} ${style.bg}`
                  : "border border-gray-200 bg-gray-50"
              }
              ${isSelected ? "ring-2 ring-red-400" : ""}
              group`}>
              <div className="flex items-center gap-3">
                {selectMode && (
                  <Checkbox
                    checked={isSelected}
                    onChange={() => toggleSelect(n.id)}
                    className="!bg-white"
                  />
                )}
                <div className="flex-shrink-0">{style.icon}</div>
                <div
                  className="flex flex-col cursor-pointer"
                  onClick={() => isUnread && markAsRead(n.id)}>
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

              {/* Nút xóa hover */}
              {!selectMode && !isUnread && (
                <button
                  className="absolute top-2 right-2 flex items-center justify-center
                  w-8 h-8 rounded-full bg-white/80 text-red-600
                  shadow-md hover:bg-red-500 hover:text-white
                  transition-all duration-200 opacity-0 group-hover:opacity-100"
                  onClick={() => showDeleteConfirm([n.id])}>
                  <HiXCircle size={24} />
                </button>
              )}

              {isUnread && !selectMode && (
                <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />

      {/* Modal confirm */}
      <ConfirmDialog
        show={confirmOpen}
        message={`Bạn có chắc muốn xóa ${deleteTargetIds.length} thông báo?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen(false)}
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
};

export default NotificationList;
