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
import type { Order } from "../../pages/admin/orders/AdminOrderFood"; // nếu bạn tách type cho items

interface OrderDetailModalProps {
  show: boolean;
  onClose: () => void;
  order: Order | null;
  onApprove?: (publicId: string) => void;
  onCancel?: (publicId: string) => void;
  formatPrice: (price: number) => string;
}

export const OrderDetailModal = ({
  show,
  onClose,
  order,
  onApprove,
  onCancel,
  formatPrice,
}: OrderDetailModalProps) => {
  if (!order) return null;

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
    <Modal
      show={show}
      onClose={onClose}
      size="4xl"
      className="shadow-lg z-[70]">
      {/* Header */}
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          Order Details - {order.publicId.slice(0, 8)}
        </h3>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-6 space-y-6 bg-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
          <div className="space-y-6">
            <p>
              <strong>Payment:</strong> {order.paymentMethod} -{" "}
              {order.paymentStatus}
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
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-left px-3 py-2">
                  Item Name
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-center px-3 py-2">
                  Quantity
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-right px-3 py-2">
                  Price
                </TableHeadCell>
                <TableHeadCell className="w-20 !bg-gray-50 text-gray-700 text-right px-3 py-2">
                  Subtotal
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={
                    idx % 2 === 0
                      ? "bg-gray-50 hover:!bg-gray-200"
                      : "hover:!bg-gray-200"
                  }>
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
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-end space-x-2">
        {order.status === "PENDING" && onApprove && (
          <Button color="green" onClick={() => onApprove(order.publicId)}>
            Approve
          </Button>
        )}
        {order.status !== "DELIVERED" && onCancel && (
          <Button color="red" onClick={() => onCancel(order.publicId)}>
            Cancel
          </Button>
        )}
        <Button color="red" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
