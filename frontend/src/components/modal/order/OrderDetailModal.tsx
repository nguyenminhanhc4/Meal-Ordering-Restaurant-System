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
import type { Order } from "../../../pages/admin/orders/AdminOrderFood";
import { useTranslation } from "react-i18next"; // <-- added

interface OrderDetailModalProps {
  show: boolean;
  onClose: () => void;
  order: Order | null;
  onApprove?: (publicId: string) => void;
  onStartDelivery?: (publicId: string) => void;
  onMarkDelivered?: (publicId: string) => void;
  onCancel?: (publicId: string) => void;
  onMarkPaid?: (id: number, publicId: string) => void;
  formatPrice: (price: number) => string;
}

interface OrderAction {
  labelKey: string; // <-- now a translation key
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
  const { t } = useTranslation(); // <-- i18n hook

  if (!order) return null;

  // Badge color (unchanged – backend codes)
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

  // Action buttons – now using translation keys
  const actions: OrderAction[] = [
    {
      labelKey: "admin.orders.detail.actions.approve",
      color: "green",
      onClick: onApprove!,
      visible: (status) => status === "PENDING" && !!onApprove,
    },
    {
      labelKey: "admin.orders.detail.actions.startDelivery",
      color: "cyan",
      onClick: onStartDelivery!,
      visible: (status) => status === "APPROVED" && !!onStartDelivery,
    },
    {
      labelKey: "admin.orders.detail.actions.markDelivered",
      color: "purple",
      onClick: onMarkDelivered!,
      visible: (status) => status === "DELIVERING" && !!onMarkDelivered,
    },
    {
      labelKey: "admin.orders.detail.actions.cancel",
      color: "red",
      onClick: onCancel!,
      visible: (status) =>
        !["DELIVERED", "CANCELLED"].includes(status) && !!onCancel,
    },
  ];

  const showMarkPaid =
    order.paymentMethod === "COD" &&
    order.paymentStatus === "PENDING" &&
    order.status !== "CANCELLED";

  const orderCode = order.orderCode || order.publicId.slice(0, 8);

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="4xl"
      className="shadow-lg z-[70]">
      {/* Header */}
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {t("admin.orders.detail.header", { code: orderCode })}
        </h3>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-6 space-y-6 bg-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left: Customer info */}
          <div className="space-y-6">
            <p>
              <strong>{t("admin.orders.detail.customer")}:</strong>{" "}
              {order.userName} ({order.userEmail})
            </p>
            <p>
              <strong>{t("admin.orders.detail.phone")}:</strong>{" "}
              {order.shippingPhone}
            </p>
            <p>
              <strong>{t("admin.orders.detail.address")}:</strong>{" "}
              {order.shippingAddress}
            </p>
            <p>
              <strong>{t("admin.orders.detail.note")}:</strong>{" "}
              {order.shippingNote?.slice(0, 20) || "-"}
            </p>
          </div>

          {/* Right: Payment + Status info */}
          <div className="space-y-6">
            <p>
              <strong>{t("admin.orders.detail.payment")}:</strong>{" "}
              {order.paymentMethod === "COD"
                ? t("admin.orders.detail.paymentCod")
                : t("admin.orders.detail.paymentOnline")}{" "}
              -{" "}
              <Badge
                color={
                  order.paymentStatus === "COMPLETED" ? "success" : "warning"
                }>
                {order.paymentStatus}
              </Badge>
            </p>

            <p>
              <strong>{t("admin.orders.detail.status")}:</strong>{" "}
              <Badge color={getStatusBadgeColor(order.status)}>
                {order.status}
              </Badge>
            </p>

            <p>
              <strong>{t("admin.orders.detail.createdAt")}:</strong>{" "}
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
            </p>

            <p>
              <strong>{t("admin.orders.detail.total")}:</strong>{" "}
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mt-4">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="text-left !bg-gray-50 text-gray-700 px-3 py-2">
                  {t("admin.orders.detail.items.itemName")}
                </TableHeadCell>
                <TableHeadCell className="text-center !bg-gray-50 text-gray-700 px-3 py-2">
                  {t("admin.orders.detail.items.quantity")}
                </TableHeadCell>
                <TableHeadCell className="text-right !bg-gray-50 text-gray-700 px-3 py-2">
                  {t("admin.orders.detail.items.price")}
                </TableHeadCell>
                <TableHeadCell className="text-right !bg-gray-50 text-gray-700 px-3 py-2">
                  {t("admin.orders.detail.items.subtotal")}
                </TableHeadCell>
              </TableRow>
            </TableHead>

            <TableBody className="bg-white divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <TableRow key={idx} className="hover:!bg-gray-100">
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
            {t("admin.orders.detail.totalFooter")}:{" "}
            {formatPrice(order.totalAmount)}
          </div>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-between flex-wrap gap-2">
        {/* Nhóm bên trái: các action chính */}
        <div className="flex flex-wrap gap-2">
          {actions
            .filter((a) => a.visible(order.status))
            .map((a, idx) => (
              <Button
                key={idx}
                color={a.color}
                onClick={() => a.onClick(order.publicId)}>
                {t(a.labelKey)}
              </Button>
            ))}
        </div>

        {/* Nhóm bên phải: Mark Paid + Close */}
        <div className="flex flex-wrap gap-2">
          {showMarkPaid && (
            <Button
              color="green"
              onClick={() => onMarkPaid?.(order.id, order.publicId)}>
              {t("admin.orders.detail.actions.markPaid")}
            </Button>
          )}
          <Button color="gray" onClick={onClose}>
            {t("admin.orders.detail.actions.close")}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
