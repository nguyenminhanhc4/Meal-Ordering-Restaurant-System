import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Badge, Spinner, Table, Button } from "flowbite-react";
import {
  HiArrowLeft,
  HiReceiptTax,
  HiUser,
  HiCalendar,
  HiCurrencyDollar,
} from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { getOrderById } from "../../../services/order/checkoutService";
import type { OrderDtoDetail } from "../../../services/types/OrderType";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate.ts";

const OrderDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDtoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (orderId) {
          const data = await getOrderById(orderId);
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order detail", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useRealtimeUpdate<
    OrderDtoDetail,
    string,
    { orderPublicId: string; status: string }
  >(
    "/topic/order",
    getOrderById,
    (updatedOrder) => {
      setOrder((prev) => {
        if (!prev) return updatedOrder;
        return prev.publicId === updatedOrder.publicId ? updatedOrder : prev;
      });
    },
    (msg) => msg.orderPublicId
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-red-500 p-4">
        {t("order.errorNotFound")}
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const key = `order.statusLabel.${status}`;
    return t(key);
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-12 px-4 sm:px-6 md:px-8">
      <div className="container mx-auto max-w-4xl py-12 px-4 md:px-6">
        <Card className="shadow-lg !bg-white rounded-2xl p-8 border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
              <HiReceiptTax className="text-purple-600" />{" "}
              {t("order.detail.title", {
                id: order.publicId.slice(0, 8),
              })}
            </h1>
            <Badge
              color={
                order.status === "PENDING"
                  ? "yellow"
                  : order.status === "APPROVED"
                  ? "blue"
                  : order.status === "DELIVERING"
                  ? "indigo"
                  : order.status === "DELIVERED"
                  ? "green"
                  : order.status === "CANCELLED"
                  ? "red"
                  : "gray"
              }
              size="lg"
              className="px-3 py-1 text-sm">
              {getStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Order Info */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <HiUser className="text-blue-500" />
              <span className="font-medium text-gray-900">
                {t("order.detail.customer")}
              </span>{" "}
              {order.userName}
            </p>
            <p className="flex items-center gap-2">
              <HiCalendar className="text-indigo-500" />
              <span className="font-medium text-gray-900">
                {t("order.detail.createdAt")}
              </span>{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "-"}
            </p>
            <p className="flex items-center gap-2">
              <HiCurrencyDollar className="text-green-600" />
              <span className="font-medium text-gray-900">
                {t("order.detail.total")}
              </span>{" "}
              <span className="text-green-600 font-semibold">
                {order.totalAmount?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </p>
          </div>

          {/* Order Items Table */}
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            {t("order.detail.itemsTitle")}
          </h2>
          <Table
            striped
            hoverable
            className="shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">{t("order.detail.table.name")}</th>
                <th className="px-4 py-2">
                  {t("order.detail.table.quantity")}
                </th>
                <th className="px-4 py-2">{t("order.detail.table.price")}</th>
                <th className="px-4 py-2">{t("order.detail.table.total")}</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item) => (
                <tr key={item.id} className="text-gray-800">
                  <td className="px-4 py-2">{item.menuItemName}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">
                    {item.price.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                  <td className="px-4 py-2 text-green-600 font-semibold">
                    {(item.price * item.quantity).toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center">
            <Button
              color="purple"
              href="/order"
              className="flex items-center gap-2">
              <HiArrowLeft className="text-lg" /> {t("order.detail.back")}
            </Button>

            {(!order.paymentStatus || order.paymentStatus === "FAILED") && (
              <Button
                color="green"
                onClick={() =>
                  navigate(`/orders/${order.publicId}/payment`, {
                    state: { order },
                  })
                }
                className="flex items-center gap-2">
                <HiCurrencyDollar className="text-lg" /> {t("order.detail.pay")}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default OrderDetailPage;
