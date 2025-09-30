import React, { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner } from "flowbite-react";
import {
  HiExternalLink,
  HiUser,
  HiCalendar,
  HiCurrencyDollar,
  HiOutlineHome,
  HiOutlineClipboardList,
} from "react-icons/hi";
import { FaUtensils } from "react-icons/fa";
import { useNotification } from "../../../components/Notification/NotificationContext";
import { getOrdersByUser } from "../../../services/order/checkoutService";
import type { OrderDto } from "../../../services/types/OrderType";

const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { notify } = useNotification();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrdersByUser();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách order. Vui lòng thử lại.");
        notify("error", "Tải order thất bại");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6">
        <div className="flex justify-between items-center mb-10 p-4 bg-amber-50 rounded-xl shadow-sm border border-amber-100">
          <h1 className="text-3xl font-extrabold text-amber-800 flex items-center gap-3">
            <HiOutlineClipboardList className="w-8 h-8 text-amber-600" />
            Danh sách đơn hàng
          </h1>
          <Button
            size="sm"
            className="!bg-emerald-600 hover:!bg-emerald-700 text-white shadow-md flex items-center gap-2 rounded-lg"
            href="/menu">
            <HiOutlineHome className="w-4 h-4" /> Quay lại Menu
          </Button>
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => {
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

              // màu card theo status
              const borderColor =
                order.status === "PENDING"
                  ? "!border-yellow-300"
                  : order.status === "COMPLETED"
                  ? "!border-green-300"
                  : "!border-red-300";

              return (
                <Card
                  key={order.publicId}
                  className={`relative shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 rounded-2xl border-t-4 ${borderColor} !bg-white`}>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      Order #{shortId}
                    </h2>
                    <Badge
                      color={
                        order.status === "PENDING"
                          ? "yellow"
                          : order.status === "COMPLETED"
                          ? "green"
                          : "red"
                      }>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Info */}
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

                  {/* Action */}
                  <Button
                    size="sm"
                    className="flex text-white items-center gap-1 mt-4 !bg-blue-600 hover:!bg-blue-700 transition-colors duration-200 w-full justify-center"
                    href={`/orders/${order.publicId}`}>
                    <HiExternalLink /> Xem chi tiết
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào.</p>
          </Card>
        )}
      </div>
    </section>
  );
};

export default OrderListPage;
