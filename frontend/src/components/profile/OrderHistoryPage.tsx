import { useEffect, useState } from "react";
import { Spinner, Badge } from "flowbite-react";
import {
  FaSearch,
  FaFilter,
  FaCalendar,
  FaChevronUp,
  FaChevronDown,
  FaLongArrowAltRight,
} from "react-icons/fa";
import { MdFastfood } from "react-icons/md";
import {
  fetchOrderHistory,
  type Order,
} from "../../services/order/orderService";
import {
  getCurrentCart,
  createCart,
  addItemToCart,
} from "../../services/cart/cartService";
import { useNotification } from "../Notification/NotificationContext";
import Pagination from "../../components/common/PaginationClient";
import { format } from "date-fns";
import { useCart } from "../../store/CartContext";
import axios from "axios";
import { connectWebSocket } from "../../api/websocketClient";
import { useTranslation } from "react-i18next";

export default function OrderHistoryPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const { notify } = useNotification();
  const { fetchCart } = useCart();

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    fromDate: "",
    toDate: "",
    sort: "createdAt,desc",
  });

  const handleReorder = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order || !order.items) return;

      let cart = await getCurrentCart().catch(() => null);
      if (!cart) cart = await createCart();

      for (const item of order.items) {
        await addItemToCart(cart.id, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        });
      }

      notify("success", t("orderHistory.notifications.addToCartSuccess"));
      await fetchCart();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message ?? error.message;
        notify("error", msg);
      } else {
        notify("error", t("orderHistory.notifications.addToCartFail"));
      }
    }
  };

  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {}
  );

  const loadOrders = async (pageNumber = 0) => {
    setLoading(true);
    try {
      const data = await fetchOrderHistory({
        page: pageNumber,
        size: 5,
        ...filters,
      });
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(0);
  }, [filters]);

  // WebSocket realtime menu items
  useEffect(() => {
    if (!orders?.length) return;
    const itemIds = orders.flatMap((o) => o.items.map((i) => i.menuItemId));
    const clients = itemIds.map((id) =>
      connectWebSocket<{ menuItemId: number; status: string }>(
        `/topic/menu/${id}`,
        (data) => {
          setOrders((prev) =>
            prev.map((order) => ({
              ...order,
              items: order.items.map((item) =>
                item.menuItemId === data.menuItemId
                  ? { ...item, status: data.status }
                  : item
              ),
            }))
          );
        }
      )
    );
    return () => clients.forEach((c) => c.deactivate());
  }, [orders]);

  // WebSocket realtime order status
  useEffect(() => {
    if (!orders?.length) return;
    const client = connectWebSocket<{ orderPublicId: string; status: string }>(
      "/topic/order",
      (data) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === data.orderPublicId ? { ...o, status: data.status } : o
          )
        );
      }
    );

    return () => {
      client.deactivate();
    };
  }, [orders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "APPROVED":
        return "info";
      case "DELIVERING":
        return "purple";
      case "DELIVERED":
        return "success";
      case "CANCELLED":
        return "failure";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return t("orderHistory.status.pending");
      case "APPROVED":
        return t("orderHistory.status.approved");
      case "DELIVERING":
        return t("orderHistory.status.delivering");
      case "DELIVERED":
        return t("orderHistory.status.delivered");
      case "CANCELLED":
        return t("orderHistory.status.cancelled");
      default:
        return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <MdFastfood className="mr-2 text-yellow-600" />{" "}
        {t("orderHistory.title")}
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl border border-green-200 shadow-sm">
          <FaSearch className="w-5 h-5 text-green-600" />
          <input
            type="text"
            placeholder={t("orderHistory.filters.searchPlaceholder")}
            className="border border-green-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            value={filters.keyword}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, keyword: e.target.value }))
            }
          />
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 shadow-sm">
          <FaFilter className="w-5 h-5 text-blue-600" />
          <select
            className="border border-blue-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }>
            <option value="">{t("orderHistory.filters.status.all")}</option>
            <option value="DELIVERED">
              {t("orderHistory.status.delivered")}
            </option>
            <option value="PENDING">{t("orderHistory.status.pending")}</option>
            <option value="DELIVERING">
              {t("orderHistory.status.delivering")}
            </option>
            <option value="APPROVED">
              {t("orderHistory.status.approved")}
            </option>
            <option value="CANCELLED">
              {t("orderHistory.status.cancelled")}
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200 shadow-sm">
          <FaCalendar className="w-5 h-5 text-yellow-600" />
          <input
            type="date"
            className="border border-yellow-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
            }
          />
          <span className="text-gray-400">
            <FaLongArrowAltRight className="text-yellow-600" />
          </span>
          <input
            type="date"
            className="border border-yellow-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, toDate: e.target.value }))
            }
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="xl" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-10">
          {t("orderHistory.noOrders")}
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const maxVisible = 3;
            const isExpanded = expandedOrders[order.id] || false;
            const displayItems = isExpanded
              ? order.items
              : order.items.length <= maxVisible
              ? order.items
              : order.items.slice(0, maxVisible - 1);
            const remainingCount = order.items.length - displayItems.length;

            return (
              <div
                key={order.id}
                className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      {t("orderHistory.orderId")}: #{order.id.slice(0, 8)} •{" "}
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    <Badge
                      color={getStatusColor(order.status)}
                      className="mt-1">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="font-semibold text-lg text-amber-700">
                    {order.totalAmount.toLocaleString()} ₫
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {displayItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 bg-gray-50 p-3 rounded-lg items-center ${
                        item.status === "OUT_OF_STOCK" ? "opacity-50" : ""
                      }`}>
                      <img
                        src={item.imageUrl}
                        alt={item.menuItemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{item.menuItemName}</span>
                        <span className="text-sm text-gray-600">
                          {t("orderHistory.quantity")}: {item.quantity} •{" "}
                          {item.price.toLocaleString()} ₫
                        </span>
                        {item.status === "OUT_OF_STOCK" && (
                          <Badge color="failure" size="sm" className="mt-1">
                            {t("orderHistory.outOfStock")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {!isExpanded && order.items.length > 3 && (
                    <div
                      className="flex items-center justify-center bg-gray-100 p-3 rounded-lg text-gray-500 font-medium cursor-pointer"
                      onClick={() => toggleExpand(order.id)}>
                      +{remainingCount} {t("orderHistory.moreItems")}
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-3">
                  {order.items.length > maxVisible && (
                    <button
                      className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 transition rounded px-2 py-1 bg-blue-50 hover:bg-blue-100"
                      onClick={() => toggleExpand(order.id)}>
                      {isExpanded
                        ? t("orderHistory.collapse")
                        : `${t("orderHistory.viewAll")} (+${remainingCount})`}
                      {isExpanded ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <div className="flex-grow" />
                  <button
                    className="text-sm text-white font-medium rounded px-3 py-1 bg-amber-600 hover:bg-amber-700 transition"
                    onClick={() => handleReorder(order.id)}>
                    {t("orderHistory.reorder")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={(p) => loadOrders(p)}
      />
    </div>
  );
}
