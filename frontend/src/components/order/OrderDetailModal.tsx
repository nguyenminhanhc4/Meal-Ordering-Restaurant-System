import {
  Modal,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Badge,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "flowbite-react";

import { format } from "date-fns";
import type { Order } from "../../pages/admin/orders/AdminOrderFood";

interface OrderDetailModalProps {
  show: boolean;
  onClose: () => void;
  order: Order | null;
  onApprove?: (publicId: string) => void;
  onStartDelivery?: (publicId: string) => void;
  onMarkDelivered?: (publicId: string) => void;
  onCancel?: (publicId: string) => void;
  onMarkPaid?: (publicId: string) => void;
  formatPrice: (price: number) => string;
}

interface OrderAction {
  label: string;
  color: string;
  onClick: (publicId: string) => void;
  visible: (status: string) => boolean;
}

export const OrderDetailModal = ({
  show,
  onClose,
  order,
  onApprove,
  onStartDelivery,
  onMarkDelivered,
  onCancel,
  onMarkPaid,
  formatPrice,
}: OrderDetailModalProps) => {
  if (!order) return null;

  // 🎨 Badge màu theo trạng thái
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "warning",
      APPROVED: "info",
      DELIVERING: "purple",
      DELIVERED: "success",
      CANCELLED: "failure",
    };
    return colors[status] || "gray";
  };

  console.log(order.status);
  // 🧭 Nút hành động chính
  const actions: OrderAction[] = [
    {
      label: "Approve",
      color: "green",
      onClick: onApprove!,
      visible: (status) => status === "PENDING" && !!onApprove,
    },
    {
      label: "Start Delivery",
      color: "cyan",
      onClick: onStartDelivery!,
      visible: (status) => status === "APPROVED" && !!onStartDelivery,
    },
    {
      label: "Mark Delivered",
      color: "purple",
      onClick: onMarkDelivered!,
      visible: (status) => status === "DELIVERING" && !!onMarkDelivered,
    },
    {
      label: "Cancel",
      color: "red",
      onClick: onCancel!,
      visible: (status) =>
        !["DELIVERED", "CANCELLED"].includes(status) && !!onCancel,
    },
  ];

  // 💵 Nút xác nhận thanh toán (chỉ dành cho COD)
  const showMarkPaid =
    order.paymentMethod === "COD" && order.paymentStatus === "PENDING";

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="4xl"
      className="shadow-lg z-[70]">
      {/* Header */}
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          Order #{order.orderCode || order.publicId.slice(0, 8)} -
          <Badge color={getStatusBadgeColor(order.status)}>
            {order.status}
          </Badge>
        </h3>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-6 space-y-6 bg-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left: Customer info */}
          <div className="space-y-6">
            <p>
              <strong>Customer:</strong> {order.userName} ({order.userEmail})
            </p>
            <p>
              <strong>Phone:</strong> {order.shippingPhone}
            </p>
            <p>
              <strong>Address:</strong> {order.shippingAddress}
            </p>
          </div>

          {/* Right: Payment + Status info */}
          <div className="space-y-6">
            <p>
              <strong>Payment:</strong>{" "}
              {order.paymentMethod === "COD"
                ? "Cash on Delivery"
                : "Online Payment"}{" "}
              -{" "}
              <Badge
                color={order.paymentStatus === "PAID" ? "success" : "warning"}>
                {order.paymentStatus}
              </Badge>
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <Badge color={getStatusBadgeColor(order.status)}>
                {order.status}
              </Badge>
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
            <p>
              <strong>Total:</strong> {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mt-4">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="text-left !bg-gray-50 text-gray-700 px-3 py-2">
                  Item Name
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-gray-50 text-gray-700 px-3 py-2">
                  Quantity
                </TableHeadCell>
                <TableHeadCell className="text-right !bg-gray-50 text-gray-700 px-3 py-2">
                  Price
                </TableHeadCell>
                <TableHeadCell className="text-right !bg-gray-50 text-gray-700 px-3 py-2">
                  Subtotal
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={`${
                    idx % 2 === 0 ? "bg-gray-50" : ""
                  } hover:!bg-gray-200`}>
                  <TableCell className="text-sm text-gray-700 px-3 py-2 text-left">
                    {item.menuItemName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 px-3 py-2 text-center">
                    {item.quantity}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 px-3 py-2 text-right">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700 px-3 py-2 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-right font-semibold mt-2">
            Total: {formatPrice(order.totalAmount)}
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-end flex-wrap gap-2">
        {/* Nút hành động chính */}
        {actions
          .filter((a) => a.visible(order.status))
          .map((a, idx) => (
            <Button
              key={idx}
              color={a.color}
              onClick={() => a.onClick(order.publicId)}>
              {a.label}
            </Button>
          ))}

        {/* Nút riêng cho COD */}
        {showMarkPaid && (
          <Button color="green" onClick={() => onMarkPaid?.(order.publicId)}>
            Mark as Paid
          </Button>
        )}

        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
