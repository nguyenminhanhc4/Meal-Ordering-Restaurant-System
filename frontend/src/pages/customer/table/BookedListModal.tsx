import {
  Modal,
  ModalHeader,
  ModalBody,
  Spinner,
  Button,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
} from "flowbite-react";
import type { Reservation } from "../../../services/reservation/reservationService";
import type { TableEntity } from "../../../services/table/tableService";
import { useTranslation } from "react-i18next";

// Import Heroicons (Hi) và Font Awesome (Fa)
import {
  HiOutlinePencil, // Sửa
  HiOutlineXMark, // Hủy
  HiOutlineUserGroup, // Số người
  HiOutlineClock, // Thời gian
  HiOutlineClipboardDocumentList, // Ghi chú
} from "react-icons/hi2";
import { FaChair } from "react-icons/fa"; // Icon Bàn

interface BookedListModalProps {
  show: boolean;
  onClose: () => void;
  reservations: Reservation[];
  tables: TableEntity[];
  loading: boolean;
  onEdit: (reservation: Reservation) => void;
  onCancel: (publicId: string) => void;
  translateStatus: (status: string) => string;
}

export default function BookedListModal({
  show,
  onClose,
  reservations,
  tables,
  loading,
  onEdit,
  onCancel,
  translateStatus,
}: BookedListModalProps) {
  const { t } = useTranslation();
  return (
    <Modal show={show} onClose={onClose} popup size="5xl">
      <ModalHeader className="!bg-stone-700 !border-b-4 !border-yellow-600">
        <div className="text-2xl font-bold text-yellow-400">
          {t("bookedList.title")}
        </div>
      </ModalHeader>

      <ModalBody className="bg-gray-50 p-6">
        {/* 1. Trạng thái Loading */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner size="xl" color="warning" />
          </div>
        ) : /* 2. Trạng thái Không có đặt bàn */
        reservations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg font-medium">
              ☕ {t("bookedList.empty.title")}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {t("bookedList.empty.message")}
            </p>
          </div>
        ) : (
          /* 3. Hiển thị dưới dạng Bảng */
          <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
            <Table hoverable>
              <TableHead>
                <TableHeadCell className="p-4 !bg-stone-100"></TableHeadCell>
                <TableHeadCell className="text-black !bg-stone-100">
                  {t("bookedList.tableTime")}
                </TableHeadCell>
                <TableHeadCell className="text-black !bg-stone-100">
                  {t("bookedList.details")}
                </TableHeadCell>
                <TableHeadCell className="text-black !bg-stone-100">
                  {t("bookedList.statusHeader")}
                </TableHeadCell>
                <TableHeadCell className="text-center text-black !bg-stone-100">
                  {t("bookedList.actions")}
                </TableHeadCell>
              </TableHead>

              {/* PHẦN THÂN BẢNG */}
              <TableBody className="divide-y">
                {reservations.map((res, index) => {
                  const tableNames =
                    res.tableIds
                      ?.map(
                        (id) =>
                          tables.find((t) => t.id === id)?.name || `(ID ${id})`
                      )
                      .join(", ") || t("bookedList.unknownTable");

                  const statusColorMap: Record<string, string> = {
                    CONFIRMED: "text-green-700 bg-green-100",
                    PENDING: "text-yellow-700 bg-yellow-100",
                    CANCELLED: "text-red-700 bg-red-100",
                    COMPLETED: "text-blue-700 bg-blue-200",
                    DEFAULT: "text-blue-700 bg-blue-100",
                  };
                  const statusColorClass =
                    statusColorMap[res.statusName] || statusColorMap.DEFAULT;

                  const displayStatus =
                    translateStatus(res.statusName) ||
                    t("bookedList.status.processing");

                  return (
                    <TableRow
                      key={res.id}
                      // SỬ DỤNG !bg-white ĐỂ GHI ĐÈ MÀU MẶC ĐỊNH CHO HÀNG
                      className="!bg-white">
                      {/* Cột STT/Icon */}
                      <TableCell className="p-4 font-bold text-gray-500">
                        {index + 1}
                      </TableCell>

                      {/* Cột Bàn & Thời gian */}
                      <TableCell className="whitespace-nowrap font-medium text-gray-900">
                        <p className="font-extrabold text-lg text-stone-800 flex items-center mb-1">
                          <FaChair className="w-4 h-4 mr-2 text-yellow-600" />{" "}
                          {/* Icon FaChair (Font Awesome) */}
                          {tableNames}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <HiOutlineClock className="w-4 h-4 mr-1 text-blue-500" />{" "}
                          {/* Icon HiOutlineClock (Heroicons) */}
                          {new Date(res.reservationTime).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </TableCell>

                      {/* Cột Chi tiết */}
                      <TableCell className="text-sm text-gray-700">
                        <p className="flex items-center mb-1">
                          <HiOutlineUserGroup className="w-4 h-4 mr-1 text-green-500" />{" "}
                          {/* Icon HiOutlineUserGroup (Heroicons) */}
                          <span className="font-medium mr-1">
                            {t("bookedList.people")}:
                          </span>
                          {res.numberOfPeople}
                        </p>
                        {res.note && (
                          <p className="text-gray-500 italic flex items-center">
                            <HiOutlineClipboardDocumentList className="w-4 h-4 mr-1 text-purple-500" />{" "}
                            {/* Icon Ghi chú */}
                            {res.note.substring(0, 50)}
                            {res.note.length > 50 ? "..." : ""}
                          </p>
                        )}
                      </TableCell>

                      {/* Cột Trạng thái */}
                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusColorClass}`}>
                          {displayStatus}
                        </span>
                      </TableCell>

                      {/* Cột Hành động */}
                      <TableCell className="min-w-[150px]">
                        <div className="flex gap-2 justify-center">
                          {res.statusName !== "CANCELLED" &&
                          res.statusName !== "COMPLETED" ? (
                            <>
                              <Button
                                size="sm"
                                color="yellow"
                                onClick={() => onEdit(res)}
                                className="p-0 h-8 w-8 justify-center items-center"
                                title={t("bookedList.edit")}>
                                <HiOutlinePencil className="w-4 h-4" />
                              </Button>

                              <Button
                                size="sm"
                                color="red"
                                onClick={() => onCancel(res.publicId)}
                                className="p-0 h-8 w-8 justify-center items-center"
                                title={t("bookedList.cancel")}>
                                <HiOutlineXMark className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-gray-400 italic text-sm">
                              {res.statusName === "CANCELLED"
                                ? t("bookedList.status.cancelled")
                                : t("bookedList.status.completed")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
