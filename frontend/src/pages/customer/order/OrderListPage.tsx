// src/pages/customer/orders/OrderListPage.tsx
import React, { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner } from "flowbite-react";
import { HiExternalLink } from "react-icons/hi";
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
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách order. Vui lòng thử lại.");
        notify("error", "Tải order thất bại");
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
    <section className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-6xl py-12 px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Danh sách đơn hàng
        </h1>

        {orders.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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

              return (
                <Card
                  key={order.publicId}
                  className="shadow-md hover:shadow-xl transition-shadow duration-300 !bg-white rounded-xl">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      Order #{shortId}
                    </h2>
                    <Badge
                      color={
                        order.status === "PENDING"
                          ? "warning"
                          : order.status === "COMPLETED"
                          ? "success"
                          : "failure"
                      }>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Info */}
                  <p className="text-gray-600 text-sm mb-1">
                    Người đặt:{" "}
                    <span className="font-medium">{order.userName}</span>
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    Ngày tạo:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "-"}
                  </p>
                  <p className="text-gray-600 text-sm mb-1">
                    Tổng món: <span className="font-medium">{totalItems}</span>
                  </p>
                  <p className="text-gray-700 text-sm mb-2">
                    Món: {itemPreview}
                    {hasMoreItems && " ..."}
                  </p>

                  {/* Total */}
                  <p className="text-gray-800 font-bold text-lg mb-4">
                    {order.totalAmount?.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </p>

                  {/* Action */}
                  <Button
                    size="sm"
                    className="flex text-white items-center gap-1 mt-auto !bg-blue-600 hover:!bg-blue-700 transition-colors duration-200"
                    onClick={() =>
                      (window.location.href = `/orders/${order.publicId}`)
                    }>
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
