import React, { useEffect, useState } from "react";
import { Card, Badge, Button } from "flowbite-react";
import {
  HiExternalLink,
  HiUser,
  HiCalendar,
  HiCurrencyDollar,
  HiOutlineHome,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { FaUtensils, FaFilter } from "react-icons/fa";
import { useNotification } from "../../../components/Notification/NotificationContext";
import {
  getOrdersByUser,
  getOrderById,
} from "../../../services/order/checkoutService";
import type { OrderDto } from "../../../services/types/OrderType";
import Pagination from "../../../components/common/PaginationClient";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate";
import api from "../../../api/axios";

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingNext, setLoadingNext] = useState(false); // Loading khi đổi trang
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(6);
  const [orderStatuses, setOrderStatuses] = useState<
    { code: string; name: string }[]
  >([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const { notify } = useNotification();

  // Giữ dữ liệu cũ khi đổi trang, chỉ update khi data về
  useEffect(() => {
    const fetchOrders = async () => {
      if (currentPage === 0) setLoading(true);
      else setLoadingNext(true);

      try {
        const data = await getOrdersByUser(
          currentPage,
          pageSize,
          selectedStatus
        );
        setOrders(data.content);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách order. Vui lòng thử lại.");
        notify("error", "Tải order thất bại");
      } finally {
        setLoading(false);
        setLoadingNext(false);
      }
    };
    fetchOrders();
  }, [notify, currentPage, pageSize, selectedStatus]);

  useRealtimeUpdate(
    `/topic/order`, // topic backend gửi
    getOrderById, // fetchFn: lấy order mới nhất
    (updatedOrder: OrderDto) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.publicId === updatedOrder.publicId ? updatedOrder : o
        )
      );
    },
    (msg: { orderPublicId: string; status: string }) => msg.orderPublicId // getIdFromMsg
  );

  useEffect(() => {
    const controller = new AbortController();

    const loadOrderStatuses = async (signal: AbortSignal) => {
      try {
        const res = await api.get("/params?type=ORDER_STATUS", { signal });
        if (res.data?.data) setOrderStatuses(res.data.data);
      } catch {
        if (!signal.aborted)
          notify("error", "Không thể tải danh sách trạng thái.");
      }
    };

    loadOrderStatuses(controller.signal);
    return () => controller.abort();
  }, [notify]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(0); // reset về trang đầu tiên
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning"; // vàng
      case "APPROVED":
        return "info"; // xanh dương
      case "DELIVERING":
        return "purple"; // tím
      case "DELIVERED":
        return "success"; // xanh lá
      case "CANCELLED":
        return "failure"; // đỏ
      default:
        return "gray"; // fallback
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "!border-yellow-300";
      case "APPROVED":
        return "!border-blue-300";
      case "DELIVERING":
        return "!border-purple-300";
      case "DELIVERED":
        return "!border-green-300";
      case "CANCELLED":
        return "!border-red-300";
      default:
        return "!border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "APPROVED":
        return "Đã duyệt";
      case "DELIVERING":
        return "Đang giao";
      case "DELIVERED":
        return "Đã giao";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6">
        <div className="flex justify-between items-center mb-10 p-4 bg-amber-50 rounded-xl shadow-sm border border-amber-100 flex-wrap gap-4">
          <h1 className="text-3xl font-extrabold text-amber-800 flex items-center gap-3">
            <HiOutlineClipboardList className="w-8 h-8 text-amber-600" />
            Danh sách đơn hàng
          </h1>

          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200 shadow-sm w-full md:max-w-xs">
            <FaFilter className="w-5 h-5 text-yellow-600" />
            <select
              className="flex-1 border border-yellow-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition"
              value={selectedStatus}
              onChange={handleStatusChange}
              aria-label="Chọn trạng thái đơn hàng">
              <option value="">Tất cả</option>
              {orderStatuses.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            className="!bg-emerald-600 hover:!bg-emerald-700 text-white shadow-md flex items-center gap-2 rounded-lg"
            href="/menu">
            <HiOutlineHome className="w-4 h-4" /> Quay lại Menu
          </Button>
        </div>

        {error && (
          <div className="text-center text-red-500 p-4">
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.length === 0 && !loading ? (
            <Card className="text-center py-12 col-span-full">
              <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào.</p>
            </Card>
          ) : (
            orders.map((order) => {
              const shortId = order.publicId.slice(0, 8);
              const totalItems = order.orderItems?.reduce(
                (sum, item) => sum + item.quantity,
                0
              );
              const itemPreview = order.orderItems
                ?.slice(0, 2)
                .map((item) => `${item.menuItemName} x${item.quantity}`)
                .join(", ");
              const hasMoreItems =
                order.orderItems && order.orderItems.length > 2;

              const borderColor = getBorderColor(order.status);

              return (
                <Card
                  key={order.publicId}
                  className={`relative shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl border-t-4 ${borderColor} !bg-white`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      Order #{shortId}
                    </h2>
                    <Badge color={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="flex items-center gap-2">
                      <HiUser className="text-blue-500" /> {order.userName}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaUtensils className="text-orange-500" /> {totalItems}{" "}
                      món
                    </p>
                    <p className="line-clamp-1 text-gray-600">
                      Món: {itemPreview}
                      {hasMoreItems && " ..."}
                    </p>
                    <p className="flex items-center gap-2 font-semibold text-green-600 text-base">
                      <HiCurrencyDollar />{" "}
                      {order.totalAmount?.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                    <p className="flex items-center gap-2 text-gray-500 text-xs">
                      <HiCalendar />{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="flex text-white items-center gap-1 mt-4 !bg-blue-600 hover:!bg-blue-700 transition-colors duration-200 w-full justify-center"
                    href={`/orders/${order.publicId}`}>
                    <HiExternalLink /> Xem chi tiết
                  </Button>
                </Card>
              );
            })
          )}

          {loading &&
            Array.from({ length: pageSize }).map((_, idx) => (
              <div
                key={idx}
                className="h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
            ))}
        </div>

        {/* Pagination */}
        {orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </section>
  );
};

export default OrderListPage;
