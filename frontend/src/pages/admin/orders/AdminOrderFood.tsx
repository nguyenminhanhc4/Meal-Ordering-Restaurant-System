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
import { HiSearch } from "react-icons/hi";
import api from "../../../api/axios";
import { useNotification } from "../../../components/Notification";
import { Pagination } from "../../../components/common/Pagination";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";
import { format } from "date-fns";

interface Order {
  id: number;
  publicId: string;
  orderCode: string;
  totalAmount: number;
  createdAt: string;
  userName: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // ✅ Fetch Orders API (đã fix cấu trúc dữ liệu)
  const fetchOrders = useCallback(
    async (
      page: number,
      size: number,
      keyword: string,
      statusCode: string,
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
          },
        });

        console.log("Orders API response:", response.data);
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

    void loadStatuses(abortController.signal);
    void fetchOrders(
      currentPage,
      pageSize,
      searchTerm,
      selectedStatus,
      abortController.signal
    );

    return () => abortController.abort();
  }, [notify, currentPage, searchTerm, selectedStatus, fetchOrders]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Approve order (example action)
  const handleApproveOrder = async () => {
    if (!selectedOrder) return;
    try {
      await api.post(`/orders/approve/${selectedOrder}`);
      notify("success", "Order approved successfully");
      const abortController = new AbortController();
      void fetchOrders(
        currentPage,
        pageSize,
        searchTerm,
        selectedStatus,
        abortController.signal
      );
    } catch (error: unknown) {
      console.error(error);
      notify("error", "Failed to approve order.");
    } finally {
      setShowConfirmDialog(false);
      setSelectedOrder(null);
    }
  };

  const openConfirmDialog = (orderPublicId: string) => {
    setSelectedOrder(orderPublicId);
    setShowConfirmDialog(true);
  };

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
                      base: "!bg-gray-50 border-gray-500 focus:!ring-cyan-500 focus:!border-cyan-500",
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
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  Order Code
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  Customer
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  Payment
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  Total
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  Status
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3">
                  Created At
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center p-3 text-center">
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
                    className="text-center bg-white text-gray-700 py-4">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow
                    key={order.publicId}
                    className="!bg-white hover:!bg-gray-100">
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      {order.publicId.slice(0, 8)}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      {order.userName}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <span className="text-sm text-gray-700">
                        {order.paymentMethod} - {order.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      ${order.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      <Badge color={getStatusBadgeColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="p-3 bg-white text-gray-700 text-center">
                      {order.status === "PENDING" && (
                        <Button
                          size="xs"
                          color="success"
                          onClick={() => openConfirmDialog(order.publicId)}>
                          Approve
                        </Button>
                      )}
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

      <ConfirmDialog
        show={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleApproveOrder}
        message="Are you sure you want to approve this order?"
      />
    </div>
  );
};
