import { useEffect, useState } from "react";
import {
  Spinner,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "flowbite-react";
import {
  getMyReservations,
  updateMyReservation,
  type Reservation,
} from "../../services/reservation/reservationService";
import {
  getAllTables,
  type TableEntity,
} from "../../services/table/tableService";
import {
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineClipboardDocumentList,
  HiOutlinePencilSquare,
  HiOutlineXMark,
  HiOutlineArrowsUpDown,
  HiOutlineDocument,
} from "react-icons/hi2";
import { FaChair } from "react-icons/fa";
import Pagination from "../../components/common/PaginationClient";
import BookingModal, {
  type BookingData,
} from "../../pages/customer/table/BookingModal";
import ConfirmDialog from "../../components/common/ConfirmDialogProps ";
import { useNotification } from "../Notification/NotificationContext";

export default function UserReservationHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableEntity | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // ✅ Xác nhận hủy
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [sort, setSort] = useState("createdAt,desc");

  const { notify } = useNotification();

  // ✅ Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reservationPage, tableData] = await Promise.all([
          getMyReservations(currentPage, pageSize, sort, filterStatus),
          getAllTables(),
        ]);
        if (reservationPage) {
          setReservations(reservationPage.content || []);
          setTotalPages(reservationPage.totalPages || 0);
        }
        setTables(tableData);
      } catch (error) {
        console.error("❌ Lỗi khi tải lịch sử đặt bàn:", error);
        notify("error", "Lỗi khi tải lịch sử đặt bàn");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, sort, filterStatus]);

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(0); // reset page
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setCurrentPage(0); // reset page
  };

  // ✅ Mở modal chỉnh sửa
  const handleEdit = (reservation: Reservation) => {
    const table =
      tables.find((t) => reservation.tableIds?.includes(t.id)) || null;
    setSelectedTable(table);
    setSelectedReservation(reservation);
    setShowModal(true);
  };

  // ✅ Xác nhận cập nhật
  const handleConfirmEdit = async (data: BookingData) => {
    if (!selectedReservation) return;
    try {
      await updateMyReservation(selectedReservation.publicId, {
        ...selectedReservation,
        reservationTime: data.reservationTime,
        numberOfPeople: parseInt(data.numberOfPeople),
        note: data.note || "",
      });
      setShowModal(false);

      const refreshedPage = await getMyReservations(currentPage, pageSize);
      setReservations(refreshedPage?.content || []);
      notify("success", "Cập nhật đặt bàn thành công");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật đặt bàn:", error);
      notify("error", "Lỗi khi cập nhật đặt bàn");
    }
  };

  // ✅ Khi bấm “Hủy”
  const handleCancel = (publicId: string) => {
    setCancelTargetId(publicId);
    setShowConfirm(true);
  };

  // ✅ Xác nhận “Đồng ý hủy”
  const confirmCancel = async () => {
    if (!cancelTargetId) return;
    try {
      await updateMyReservation(cancelTargetId, { statusName: "CANCELLED" });
      const refreshedPage = await getMyReservations(currentPage, pageSize);
      setReservations(refreshedPage?.content || []);
      notify("success", "Hủy đặt bàn thành công");
    } catch (error) {
      console.error("❌ Lỗi khi hủy đặt bàn:", error);
      notify("error", "Lỗi khi hủy đặt bàn");
    } finally {
      setShowConfirm(false);
      setCancelTargetId(null);
    }
  };

  // ✅ Dịch trạng thái
  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      CONFIRMED: "Đã xác nhận",
      PENDING: "Chờ xác nhận",
      CANCELLED: "Đã hủy",
      COMPLETED: "Hoàn tất",
    };
    return map[status] || "Không rõ";
  };

  return (
    <div className="p-8 w-full bg-white rounded-3xl shadow-2xl border border-blue-800">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
        <FaChair className="mr-2 text-yellow-600" /> Lịch sử đặt bàn
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Bộ lọc trạng thái */}
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 shadow-sm">
          <span className="font-medium text-blue-800 flex items-center gap-1">
            <HiOutlineDocument className="w-4 h-4 text-blue-600" /> Lọc:
          </span>
          <select
            className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-400"
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {/* Bộ sắp xếp */}
        <div className="flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200 shadow-sm">
          <span className="font-medium text-yellow-800 flex items-center gap-1">
            <HiOutlineArrowsUpDown className="w-4 h-4 text-yellow-600" /> Sắp
            xếp:
          </span>
          <select
            className="border border-yellow-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-yellow-400"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}>
            <option value="createdAt,desc">Mới nhất</option>
            <option value="createdAt,asc">Cũ nhất</option>
            <option value="reservationTime,asc">
              Thời gian đặt (sớm nhất)
            </option>
            <option value="reservationTime,desc">
              Thời gian đặt (muộn nhất)
            </option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" color="warning" />
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg font-medium">
            ☕ Bạn chưa có lịch sử đặt bàn nào.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Hãy thử đặt bàn để trải nghiệm dịch vụ nhé!
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table hoverable>
              <TableHead>
                <TableHeadCell className="!bg-stone-100 text-black">
                  #
                </TableHeadCell>
                <TableHeadCell className="!bg-stone-100 text-black">
                  Bàn & Thời gian
                </TableHeadCell>
                <TableHeadCell className="!bg-stone-100 text-black">
                  Chi tiết
                </TableHeadCell>
                <TableHeadCell className="!bg-stone-100 text-black">
                  Trạng thái
                </TableHeadCell>
                <TableHeadCell className="!bg-stone-100 text-black text-center">
                  Hành động
                </TableHeadCell>
              </TableHead>

              <TableBody className="divide-y">
                {reservations.map((res, index) => {
                  const tableNames =
                    res.tableIds
                      ?.map(
                        (id) =>
                          tables.find((t) => t.id === id)?.name || `(ID ${id})`
                      )
                      .join(", ") || "(Không rõ)";

                  const statusColorMap: Record<string, string> = {
                    CONFIRMED: "text-green-700 bg-green-100",
                    PENDING: "text-yellow-700 bg-yellow-100",
                    CANCELLED: "text-red-700 bg-red-100",
                    COMPLETED: "text-gray-700 bg-gray-200",
                    DEFAULT: "text-blue-700 bg-blue-100",
                  };
                  const statusColorClass =
                    statusColorMap[res.statusName] || statusColorMap.DEFAULT;

                  return (
                    <TableRow key={res.id} className="!bg-white">
                      <TableCell className="p-4 font-bold text-center text-gray-500">
                        {index + 1 + currentPage * pageSize}
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-gray-900">
                        <p className="font-semibold text-lg flex items-center mb-1">
                          <FaChair className="w-4 h-4 mr-2 text-yellow-600" />
                          {tableNames}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <HiOutlineClock className="w-4 h-4 mr-1 text-blue-500" />
                          {new Date(res.reservationTime).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      </TableCell>

                      <TableCell className="text-sm text-gray-700">
                        <p className="flex items-center mb-1">
                          <HiOutlineUserGroup className="w-4 h-4 mr-1 text-green-500" />
                          <span className="font-medium mr-1">Số người:</span>
                          {res.numberOfPeople}
                        </p>
                        {res.note && (
                          <p className="text-gray-500 italic flex items-center">
                            <HiOutlineClipboardDocumentList className="w-4 h-4 mr-1 text-purple-500" />
                            {res.note.length > 50
                              ? res.note.substring(0, 50) + "..."
                              : res.note}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center ${statusColorClass}`}>
                          {translateStatus(res.statusName)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex justify-center gap-1.5">
                          {res.statusName !== "CANCELLED" &&
                          res.statusName !== "COMPLETED" ? (
                            <>
                              <Button
                                size="xs"
                                color="warning"
                                onClick={() => handleEdit(res)}
                                className="!p-1.5 !bg-amber-500 hover:!bg-amber-600 text-white rounded-lg">
                                <HiOutlinePencilSquare className="w-4 h-4" />
                              </Button>

                              <Button
                                size="xs"
                                color="failure"
                                onClick={() => handleCancel(res.publicId)}
                                className="!p-1.5 !bg-red-500 hover:!bg-red-600 text-white rounded-lg">
                                <HiOutlineXMark className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-gray-400 italic text-sm">
                              {res.statusName === "CANCELLED"
                                ? "Đã hủy"
                                : "Hoàn tất"}
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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />

          {/* Modal chỉnh sửa */}
          <BookingModal
            show={showModal}
            table={selectedTable}
            onClose={() => setShowModal(false)}
            minDateTime={new Date().toISOString().slice(0, 16)}
            onConfirm={async () => {}}
            onConfirmEdit={handleConfirmEdit}
            existingReservation={selectedReservation}
            mode="edit"
          />

          {/* Modal xác nhận hủy */}
          <ConfirmDialog
            open={showConfirm}
            title="Xác nhận hủy đặt bàn"
            message="Bạn có chắc chắn muốn hủy đặt bàn này không?"
            confirmText="Xác nhận hủy"
            cancelText="Quay lại"
            onConfirm={confirmCancel}
            onCancel={() => setShowConfirm(false)}
          />
        </>
      )}
    </div>
  );
}
