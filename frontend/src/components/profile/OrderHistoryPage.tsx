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

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const { notify } = useNotification();
  const { fetchCart } = useCart();

  // Bộ lọc
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    fromDate: "",
    toDate: "",
    sort: "createdAt,desc",
  });

  const handleReorder = async (orderId: number) => {
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

      notify("success", "Đã thêm món vào giỏ hàng!");
      await fetchCart();
      // navigate("/cart");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message ?? error.message;
        notify("error", msg);
      } else {
        notify("error", "Lỗi không xác định khi thêm vào giỏ hàng");
      }
    }
  };

  // Trạng thái collapse cho từng đơn
  const [expandedOrders, setExpandedOrders] = useState<Record<number, boolean>>(
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
    loadOrders(page);
  }, [filters]);

  /** WebSocket realtime cho từng món */
  useEffect(() => {
    if (!orders?.length) return;

    // Lấy tất cả menuItemIds trong orders
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

    return () => {
      clients.forEach((c) => c.deactivate());
    };
  }, [orders]);

  const handleSearch = () => {
    loadOrders(0);
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <MdFastfood className="mr-2 text-yellow-600" /> Lịch sử đặt món
      </h2>

      {/* === Bộ lọc === */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Keyword search */}
        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl border border-green-200 shadow-sm">
          <FaSearch className="w-5 h-5 text-green-600" />
          <input
            type="text"
            placeholder="Tìm món..."
            className="border border-green-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-green-400 outline-none"
            value={filters.keyword}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, keyword: e.target.value }));
              handleSearch(); // tự động load khi thay đổi
            }}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 shadow-sm">
          <FaFilter className="w-5 h-5 text-blue-600" />
          <select
            className="border border-blue-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              handleSearch();
            }}>
            <option value="">Tất cả</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* From date */}
        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200 shadow-sm">
          <FaCalendar className="w-5 h-5 text-yellow-600" />
          <input
            type="date"
            className="border border-yellow-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
            value={filters.fromDate}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }));
              handleSearch();
            }}
          />
          <span className="text-gray-400">
            <FaLongArrowAltRight className="text-yellow-600" />
          </span>
          <input
            type="date"
            className="border border-yellow-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
            value={filters.toDate}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, toDate: e.target.value }));
              handleSearch();
            }}
          />
        </div>
      </div>

      {/* === Danh sách đơn hàng === */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="xl" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 text-center py-10">
          Không có đơn hàng nào phù hợp.
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
                      Mã đơn: #{order.id} •{" "}
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                    <Badge color="success" className="mt-1">
                      {order.status}
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
                          SL: {item.quantity} • {item.price.toLocaleString()} ₫
                        </span>
                        {item.status === "OUT_OF_STOCK" && (
                          <Badge color="failure" size="sm" className="mt-1">
                            Hết hàng
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}

                  {!isExpanded && order.items.length > 3 && (
                    <div
                      className="flex items-center justify-center bg-gray-100 p-3 rounded-lg text-gray-500 font-medium cursor-pointer"
                      onClick={() => toggleExpand(order.id)}>
                      +{remainingCount} món khác
                    </div>
                  )}
                </div>

                <div className="flex items-center mt-3">
                  {/* Collapse / Xem tất cả */}
                  {order.items.length > maxVisible && (
                    <button
                      className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-800 transition rounded px-2 py-1 bg-blue-50 hover:bg-blue-100"
                      onClick={() => toggleExpand(order.id)}>
                      {isExpanded
                        ? "Thu gọn"
                        : `Xem tất cả (+${remainingCount})`}
                      {isExpanded ? (
                        <FaChevronUp className="w-4 h-4" />
                      ) : (
                        <FaChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Spacer để đẩy nút Đặt lại sang phải */}
                  <div className="flex-grow" />

                  {/* Nút Đặt lại luôn nằm bên phải */}
                  <button
                    className="text-sm text-white font-medium rounded px-3 py-1 bg-amber-600 hover:bg-amber-700 transition"
                    onClick={() => handleReorder(order.id)}>
                    Đặt hàng lại
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === Phân trang === */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={(p) => loadOrders(p)}
      />
    </div>
  );
}
