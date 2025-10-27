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
import type { ReservationDTO } from "../../services/reservation/reservationService";

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

  return (
    <Modal show={show} onClose={onClose} size="4xl" className="z-[70]">
      {/* Header */}
      <ModalHeader className="!p-4 border-b bg-gray-50 !border-gray-600">
        <h3 className="text-xl font-bold text-gray-800">
          Reservation #{reservation.publicId.slice(0, 8)} -{" "}
          <Badge color={getStatusBadgeColor(reservation.statusName)}>
            {reservation.statusName}
          </Badge>
        </h3>
      </ModalHeader>

      {/* Body */}
      <ModalBody className="p-6 space-y-6 bg-gray-100 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left: Customer info */}
          <div className="space-y-4">
            <p>
              <strong>Customer:</strong> {reservation.userName}
            </p>
            <p>
              <strong>Phone:</strong> {reservation.userPhone ?? "N/A"}
            </p>
            <p>
              <strong>Number of People:</strong> {reservation.numberOfPeople}
            </p>
          </div>

          {/* Right: Time + Status info */}
          <div className="space-y-4">
            <p>
              <strong>Reservation Time:</strong>{" "}
              {formatDateTime(reservation.reservationTime)}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {formatDateTime(reservation.createdAt)}
            </p>
            <p>
              <strong>Status:</strong>{" "}
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
                  Table Name
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
        {reservation.statusName === "PENDING" && onApprove && (
          <Button color="green" onClick={() => onApprove(reservation.publicId)}>
            Approve
          </Button>
        )}
        {reservation.statusName === "CONFIRMED" && onComplete && (
          <Button color="blue" onClick={() => onComplete(reservation.publicId)}>
            Mark as Completed
          </Button>
        )}
        {reservation.statusName === "PENDING" && onCancel && (
          <Button color="red" onClick={() => onCancel(reservation.publicId)}>
            Cancel
          </Button>
        )}
        <Button color="gray" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
