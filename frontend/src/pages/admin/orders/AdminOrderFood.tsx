import { useEffect, useState, useCallback } from "react";
import {
  Button,
  TextInput,
  Card,
  Select,
  Table,
  TableCell,
  TableRow,
  TableBody,
  TableHead,
  TableHeadCell,
  Badge,
} from "flowbite-react";
import {
  updateOrderStatus,
  updatePaymentStatusByOrder,
} from "../../../services/order/checkoutService";
import { HiSearch } from "react-icons/hi";
import api from "../../../api/axios";
import { useNotification } from "../../../components/Notification";
import { Pagination } from "../../../components/common/Pagination";
// import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { format } from "date-fns";
import { OrderDetailModal } from "../../../components/order/OrderDetailModal";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate";

export interface OrderItem {
  menuItemId: number;
  menuItemName: string;
  imageUrl: string;
  status: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  publicId: string;
  orderCode?: string;
  totalAmount: number;
  createdAt: string;
  userName: string;
  userEmail: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingNote?: string;
  items: OrderItem[];
}

export const AdminOrderFood = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statuses, setStatuses] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 15;
  const { notify } = useNotification();
  // const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [paymentStatuses, setPaymentStatuses] = useState<
    { id: number; code: string; name: string }[]
  >([]);
  const [orderDetail, setOrderDetail] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleApproveOrder = async (publicId: string) => {
    try {
      await updateOrderStatus(publicId, "APPROVED");
      notify("success", "Order approved successfully!");
      fetchOrderDetail(publicId);
      refreshOrders(); // reload list
    } catch {
      notify("error", "Failed to approve order.");
    }
  };

  // 🚚 Bắt đầu giao hàng
  const handleStartDelivery = async (publicId: string) => {
    try {
      await updateOrderStatus(publicId, "DELIVERING");
      notify("success", "Order is now delivering.");
      fetchOrderDetail(publicId);
      refreshOrders();
    } catch {
      notify("error", "Failed to update delivery status.");
    }
  };

  // 📦 Đánh dấu đã giao
  const handleMarkDelivered = async (publicId: string) => {
    try {
      await updateOrderStatus(publicId, "DELIVERED");
      notify("success", "Order delivered successfully!");
      fetchOrderDetail(publicId);
      refreshOrders();
    } catch {
      notify("error", "Failed to mark delivered.");
    }
  };

  // ❌ Hủy đơn
  const handleCancelOrder = async (publicId: string) => {
    try {
      await updateOrderStatus(publicId, "CANCELLED");
      notify("success", "Order cancelled successfully.");
      fetchOrderDetail(publicId);
      refreshOrders();
    } catch {
      notify("error", "Failed to cancel order.");
    }
  };

  const handleMarkPaid = async (id: number, publicId: string) => {
    try {
      await updatePaymentStatusByOrder(id, "COMPLETED");
      notify("success", "Payment marked as paid successfully!");
      fetchOrderDetail(publicId);
      refreshOrders();
    } catch {
      notify("error", "Failed to mark payment as paid.");
    }
  };

  // ✅ Fetch Orders API (đã fix cấu trúc dữ liệu)
  const fetchOrders = useCallback(
    async (
      page: number,
      size: number,
      keyword: string,
      statusCode: string,
      paymentStatus: string,
      signal: AbortSignal
    ) => {
      setLoading(true);
      try {
        const response = await api.get("/orders", {
          signal,
          params: {
            page: page - 1,
            size,
            sort: "createdAt,desc",
            keyword: keyword.trim() || undefined,
            status: statusCode || undefined,
            paymentStatus: paymentStatus || undefined,
          },
        });

        const result = response.data;

        // ✅ Lấy đúng cấu trúc dữ liệu trả về
        if (result?.content) {
          setOrders(result.content);
          setTotalPages(result.totalPages ?? 1);
          setTotalItems(result.totalElements ?? 0);
        } else {
          setOrders([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("Fetch orders error:", error);
          notify("error", "Could not load orders. Please try again later.");
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [notify]
  );

  const refreshOrders = useCallback(() => {
    const abortController = new AbortController();
    fetchOrders(
      currentPage,
      pageSize,
      searchTerm,
      selectedStatus,
      selectedPaymentStatus,
      abortController.signal
    );
    return () => abortController.abort();
  }, [
    fetchOrders,
    currentPage,
    pageSize,
    searchTerm,
    selectedStatus,
    selectedPaymentStatus,
  ]);

  const fetchOrderDetail = async (publicId: string) => {
    try {
      const res = await api.get(`/orders/admin/${publicId}`);
      console.log("Order detail response:", res.data);
      setOrderDetail({ ...res.data }); // data là OrderResponseDTO từ backend
      setShowDetailModal(true);
    } catch (error) {
      console.error(error);
      notify("error", "Failed to load order details.");
    }
  };

  // Load order statuses and orders
  useEffect(() => {
    const abortController = new AbortController();

    const loadStatuses = async (signal: AbortSignal) => {
      try {
        const res = await api.get("/params?type=ORDER_STATUS", { signal });
        console.log("Order statuses response:", res.data.data);
        if (res.data?.data) setStatuses(res.data.data);
      } catch {
        if (!signal.aborted) notify("error", "Could not load order statuses.");
      }
    };

    const loadPaymentStatuses = async (signal: AbortSignal) => {
      try {
        const res = await api.get("/params?type=PAYMENT_STATUS", { signal });
        if (res.data?.data) setPaymentStatuses(res.data.data);
      } catch {
        if (!signal.aborted)
          notify("error", "Could not load payment statuses.");
      }
    };

    void loadStatuses(abortController.signal);
    void loadPaymentStatuses(abortController.signal);
    void fetchOrders(
      currentPage,
      pageSize,
      searchTerm,
      selectedStatus,
      selectedPaymentStatus,
      abortController.signal
    );

    return () => abortController.abort();
  }, [
    notify,
    currentPage,
    searchTerm,
    selectedStatus,
    selectedPaymentStatus,
    fetchOrders,
  ]);

  useRealtimeUpdate<Order, string, { publicId: string }>(
    "/topic/admin/orders",
    async (publicId) => {
      const res = await api.get(`/orders/admin/${publicId}`);
      return res.data;
    },
    (newOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o.publicId === newOrder.publicId)) {
          return prev.map((o) =>
            o.publicId === newOrder.publicId ? newOrder : o
          );
        }
        return [newOrder, ...prev];
      });
      notify("info", `New order received: ${newOrder.publicId.slice(0, 8)}`);
    },
    (msg) => msg.publicId // ✅ CHỈ CẦN ĐỔI DÒNG NÀY
  );

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePaymentStatusChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPaymentStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }, []);

  // const openConfirmDialog = (orderPublicId: string) => {
  //   setSelectedOrder(orderPublicId);
  //   setShowConfirmDialog(true);
  // };

  // UI rendering
  const getStatusBadgeColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
      </div>

      <Card className="!bg-white shadow-lg border-none">
        {/* Filters */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <div className="relative w-64">
              <TextInput
                placeholder="Search by customer or code..."
                value={searchTerm}
                onChange={handleSearchChange}
                icon={HiSearch}
                theme={{
                  field: {
                    input: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}
              />
            </div>
            <div className="w-48">
              <Select
                value={selectedStatus}
                onChange={handleStatusChange}
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">All Statuses</option>
                {statuses.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-48">
              <Select
                value={selectedPaymentStatus}
                onChange={handlePaymentStatusChange}
                theme={{
                  field: {
                    select: {
                      base: "!bg-gray-50 !text-gray-700 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
                    },
                  },
                }}>
                <option value="">All Payment Statuses</option>
                {paymentStatuses.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto shadow-sm rounded-md">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Order Code
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Customer
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Payment
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Total
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Status
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Created At
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Action
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center bg-white text-gray-700 py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center !bg-white text-gray-700 py-4">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.publicId}
                    className="!bg-gray-50 hover:!bg-gray-100 transition-colors duration-150">
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center truncate">
                      {order.publicId.slice(0, 8)}
                    </TableCell>
                    <TableCell
                      className="text-sm text-gray-700 px-3 py-2 text-left truncate"
                      title={order.userName}>
                      {order.userName}
                    </TableCell>
                    <TableCell
                      className="text-sm text-gray-700 px-3 py-2 text-left truncate"
                      title={`${order.paymentMethod} - ${order.paymentStatus}`}>
                      {order.paymentMethod} - {order.paymentStatus}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center">
                      <span className="font-semibold text-green-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <Badge color={getStatusBadgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 px-3 py-2 text-center">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">
                      <Button
                        size="xs"
                        color="blue"
                        onClick={() => fetchOrderDetail(order.publicId)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      </Card>

      <OrderDetailModal
        show={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={orderDetail}
        formatPrice={formatPrice}
        onApprove={handleApproveOrder}
        onStartDelivery={handleStartDelivery}
        onMarkDelivered={handleMarkDelivered}
        onCancel={handleCancelOrder}
        onMarkPaid={handleMarkPaid}
      />
    </div>
  );
};
