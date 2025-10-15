import React, { useEffect, useState } from "react";
import { Spinner, Badge } from "flowbite-react";
import { FaSearch, FaClock, FaCalendar } from "react-icons/fa";
import {
  fetchOrderHistory,
  type Order,
} from "../../services/order/orderService";
import Pagination from "../../components/common/PaginationClient";
import { format } from "date-fns";

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);

  // Bộ lọc
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    fromDate: "",
    toDate: "",
    sort: "createdAt,desc",
  });

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

  //   const handleFilterChange = (
  //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  //   ) => {
  //     setFilters((prev) => ({
  //       ...prev,
  //       [e.target.name]: e.target.value,
  //     }));
  //   };

  const handleSearch = () => {
    loadOrders(0);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-amber-700 mb-6">
        🍜 Lịch sử đặt món
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
          <FaClock className="w-5 h-5 text-blue-600" />
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
          <span className="text-gray-400">→</span>
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

        {/* Button lọc */}
        {/* <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:opacity-90 transition">
          <FaSearch className="w-5 h-5" />
        </button> */}
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
          {orders.map((order) => (
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
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 bg-gray-50 p-3 rounded-lg items-center">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
