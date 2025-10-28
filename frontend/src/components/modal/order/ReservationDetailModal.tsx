// src/pages/admin/tableOrders/ReservationDetailModal.tsx
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
import type { ReservationDTO } from "../../../services/reservation/reservationService";
import { useTranslation } from "react-i18next"; // <-- added

interface ReservationDetailModalProps {
  show: boolean;
  onClose: () => void;
  reservation: ReservationDTO | null;
  onApprove?: (publicId: string) => void;
  onComplete?: (publicId: string) => void;
  onCancel?: (publicId: string) => void;
}

export const ReservationDetailModal = ({
  show,
  onClose,
  reservation,
  onApprove,
  onComplete,
  onCancel,
}: ReservationDetailModalProps) => {
  const { t } = useTranslation(); // <-- i18n hook

  if (!reservation) return null;

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "warning",
      CONFIRMED: "success",
      CANCELLED: "failure",
      COMPLETED: "info",
    };
    return colors[status] || "gray";
  };

  const formatDateTime = (iso: string) =>
    format(new Date(iso), "dd/MM/yyyy HH:mm");

  const shortCode = reservation.publicId.slice(0, 8);

  return (
    <Modal show={show} onClose={onClose} size="4xl" className="z-[70]">
      {/* Header */}
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          {t("admin.reservations.detail.header", { code: shortCode })}
        </h3>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-6 space-y-6 bg-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left: Customer info */}
          <div className="space-y-4">
            <p>
              <strong>{t("admin.reservations.detail.customer")}:</strong>{" "}
              {reservation.userName}
            </p>
            <p>
              <strong>{t("admin.reservations.detail.phone")}:</strong>{" "}
              {reservation.userPhone ?? "N/A"}
            </p>
            <p>
              <strong>{t("admin.reservations.detail.numberOfPeople")}:</strong>{" "}
              {reservation.numberOfPeople}
            </p>
          </div>

          {/* Right: Time + Status info */}
          <div className="space-y-4">
            <p>
              <strong>{t("admin.reservations.detail.reservationTime")}:</strong>{" "}
              {formatDateTime(reservation.reservationTime)}
            </p>
            <p>
              <strong>{t("admin.reservations.detail.createdAt")}:</strong>{" "}
              {formatDateTime(reservation.createdAt)}
            </p>
            <p>
              <strong>{t("admin.reservations.detail.status")}:</strong>{" "}
              <Badge color={getStatusBadgeColor(reservation.statusName)}>
                {reservation.statusName}
              </Badge>
            </p>
          </div>
        </div>

        {/* Tables Info */}
        <div className="overflow-x-auto mt-6">
          <Table hoverable>
            <TableHead className="text-xs uppercase !bg-gray-50 text-gray-700">
              <TableRow>
                <TableHeadCell className="text-left !bg-gray-50 text-gray-700 px-3 py-2">
                  {t("admin.reservations.detail.tablesTitle")}
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="bg-white divide-y divide-gray-200">
              {reservation.tableNames.map((name, idx) => (
                <TableRow key={idx} className="hover:!bg-gray-100">
                  <TableCell className="text-sm text-gray-700 px-3 py-2 text-left">
                    {name}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ModalBody>

      {/* Footer */}
      <ModalFooter className="p-4 border-t bg-gray-50 border-gray-200 flex justify-end gap-2 flex-wrap">
        {/* Approve */}
        {reservation.statusName === "PENDING" && onApprove && (
          <Button
            color="green"
            onClick={() => onApprove(reservation.publicId)}
            aria-label={t("admin.reservations.detail.actions.approve")}>
            {t("admin.reservations.detail.actions.approve")}
          </Button>
        )}

        {/* Complete */}
        {reservation.statusName === "CONFIRMED" && onComplete && (
          <Button
            color="blue"
            onClick={() => onComplete(reservation.publicId)}
            aria-label={t("admin.reservations.detail.actions.complete")}>
            {t("admin.reservations.detail.actions.complete")}
          </Button>
        )}

        {/* Cancel */}
        {reservation.statusName === "PENDING" && onCancel && (
          <Button
            color="red"
            onClick={() => onCancel(reservation.publicId)}
            aria-label={t("admin.reservations.detail.actions.cancel")}>
            {t("admin.reservations.detail.actions.cancel")}
          </Button>
        )}

        {/* Close */}
        <Button
          color="gray"
          onClick={onClose}
          aria-label={t("admin.reservations.detail.actions.close")}>
          {t("admin.reservations.detail.actions.close")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
