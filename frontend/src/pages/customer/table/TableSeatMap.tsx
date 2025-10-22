import { useEffect, useState, useMemo } from "react";
import { Button, Spinner, Tooltip } from "flowbite-react";
import { getAllTables } from "../../../services/table/tableService";
import type { TableEntity } from "../../../services/table/tableService";
import BookingModal, { type BookingData } from "./BookingModal";
import ConfirmDialog from "../../../components/common/ConfirmDialogProps";
import {
  createMyReservation,
  getMyReservations,
  getMyReservationByPublicId,
  updateMyReservation,
} from "../../../services/reservation/reservationService";
import type { Reservation } from "../../../services/reservation/reservationService";
import BookedListModal from "./BookedListModal";
import { useNotification } from "../../../components/Notification/NotificationContext";
import { connectWebSocket } from "../../../api/websocketClient";
import { useRealtimeUpdate } from "../../../api/useRealtimeUpdate";

/** ================================
 *  COMPONENT: TableBooking
 *  Mô tả: Quản lý giao diện và logic đặt bàn của người dùng
 *  ================================ */
export default function TableBooking() {
  /** -------------------------------
   *  STATE MANAGEMENT
   *  ------------------------------- */
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [page] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTable, setSelectedTable] = useState<TableEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookedList, setShowBookedList] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);

  type BookingMode = "create" | "edit" | null;
  const [bookingModalState, setBookingModalState] = useState<BookingMode>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [targetPublicId, setTargetPublicId] = useState<string | null>(null);

  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const activeReservations = useMemo(
    () =>
      myReservations.filter(
        (res) =>
          res.statusName !== "CANCELLED" && res.statusName !== "COMPLETED"
      ),
    [myReservations]
  );

  const [loadingReservations, setLoadingReservations] = useState(false);
  const { notify } = useNotification();

  /** Danh sách ID bàn mà user đã đặt */
  const myBookedStatusMap = useMemo(() => {
    const map: Record<number, string> = {};
    myReservations
      .filter(
        (res) =>
          res.statusName !== "CANCELLED" && res.statusName !== "COMPLETED"
      )
      .forEach((res) => {
        (res.tableIds || []).forEach((id) => {
          map[id] = res.statusName; // PENDING hoặc CONFIRMED
        });
      });
    return map;
  }, [myReservations]);

  /** -------------------------------
   *  DATE TIME LIMIT (chỉ cho phép đặt từ thời điểm hiện tại)
   *  ------------------------------- */
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  /** -------------------------------
   *  DATA FETCHING
   *  ------------------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchTables(), fetchMyReservations()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const client = connectWebSocket<{ tableId: number; statusId: number }>(
      "/topic/tables",
      (update) => {
        setTables((prev) =>
          prev.map((t) =>
            t.id === update.tableId
              ? {
                  ...t,
                  statusId: update.statusId,
                  statusName: getStatusNameFromId(update.statusId),
                }
              : t
          )
        );
      }
    );

    return () => {
      // gọi async nhưng không trả về Promise cho useEffect
      client.deactivate();
    };
  }, []);

  useRealtimeUpdate<Reservation, string, { reservationPublicId: string }>(
    "/topic/reservations",
    async (id) => {
      console.log("🔄 Fetching reservation by publicId:", id);
      const res = await getMyReservationByPublicId(id);
      console.log("✅ Fetched reservation:", res);
      if (!res) throw new Error("Reservation not found");
      return res;
    },
    async (data) => {
      console.log("📡 onUpdate triggered with:", data);
      await fetchMyReservations();
      await fetchTables();
      console.log("✅ Refetched reservations and tables");
    },
    (msg) => {
      console.log("📩 WS message received:", msg);
      return msg.reservationPublicId;
    }
  );

  /** Lấy danh sách bàn */
  const fetchTables = async () => {
    try {
      const data = await getAllTables();
      setTables(data);
    } catch (error) {
      console.error("❌ Lỗi tải danh sách bàn:", error);
      notify("error", "Không thể tải danh sách bàn!");
    }
  };

  /** Lấy danh sách bàn đã đặt của user */
  const fetchMyReservations = async () => {
    setLoadingReservations(true);
    try {
      const data = await getMyReservations(page, 10);
      setMyReservations(data?.content || []);
      setTotalPages(data?.totalPages ?? 0);
    } catch (error) {
      console.error("❌ Lỗi khi tải danh sách đặt bàn:", error);
      notify("error", "Không thể tải danh sách đặt bàn!");
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleEditReservation = async (res: Reservation) => {
    const fullReservation = await getMyReservationByPublicId(res.publicId);
    if (fullReservation) {
      setEditingReservation(fullReservation);
      // ✅ Nếu reservation có tableIds (hoặc tables)
      if (fullReservation.tableIds && fullReservation.tableIds.length > 0) {
        const firstTableId = fullReservation.tableIds[0]; // hoặc chọn nhiều bàn nếu hỗ trợ multi
        // Nếu bạn có danh sách tất cả bàn (tables) ở state, có thể tìm ra đối tượng
        const table = tables.find((t) => t.id === firstTableId);
        setSelectedTable(table || null);
      }
      setBookingModalState("edit");
    }
  };

  const handleUpdateReservation = async (data: BookingData) => {
    if (!editingReservation) return;

    const payload = {
      reservationTime: data.reservationTime,
      numberOfPeople: parseInt(data.numberOfPeople),
      note: data.note || "",
      tableIds: editingReservation.tableIds, // phòng khi sửa nhiều bàn
    };

    try {
      setLoading(true);
      const updated = await updateMyReservation(
        editingReservation.publicId,
        payload
      );

      if (updated) {
        notify("success", "✅ Cập nhật đặt bàn thành công!");
        await fetchMyReservations();
        setBookingModalState(null);
        setEditingReservation(null);
      } else {
        notify("error", "Không thể cập nhật đặt bàn!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật đặt bàn:", error);
      notify("error", "Có lỗi xảy ra khi lưu thay đổi!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = (publicId: string) => {
    setTargetPublicId(publicId);
    setShowConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetPublicId) return;

    setShowConfirm(false);
    setLoading(true);
    try {
      // 🔁 Cập nhật trạng thái thành CANCELLED
      await updateMyReservation(targetPublicId, { statusName: "CANCELLED" });

      notify("success", "Đã hủy đặt bàn thành công!");
      // 🔁 Làm mới dữ liệu
      await Promise.all([fetchTables(), fetchMyReservations()]);
    } catch (error) {
      console.error("❌ Lỗi khi hủy đặt bàn:", error);
      notify("error", "Có lỗi xảy ra khi hủy đặt bàn!");
    } finally {
      setLoading(false);
      setTargetPublicId(null);
    }
  };

  /** -------------------------------
   *  TRANSLATION HELPERS
   *  ------------------------------- */
  const translateLocation = (location: string) =>
    ({
      MAIN_HALL: "Sảnh chính",
      VIP_ROOM: "Phòng VIP",
      OUTDOOR: "Ngoài trời",
      GARDEN: "Khu vườn",
      PRIVATE_ROOM: "Phòng riêng",
      BAR_AREA: "Quầy bar",
    }[location] || location);

  const translatePosition = (position: string) =>
    ({
      CENTER: "Giữa sảnh",
      FAMILY: "Gia đình",
      GOOD_VIEW: "Cảnh đẹp",
      BAR: "Quầy bar",
      VIP: "Khu vực VIP",
      PERSONAL: "Cá nhân/riêng tư",
    }[position] || position);

  const translateStatus = (status: string) =>
    ({
      AVAILABLE: "Còn trống",
      OCCUPIED: "Đang sử dụng",
      CONFIRMED: "Đã duyệt",
      PENDING: "Đang chờ duyệt",
      CANCELLED: "Đã hủy",
    }[status] || status);

  /** -------------------------------
   *  EVENT HANDLERS
   *  ------------------------------- */

  /** Mở modal đặt bàn */
  const handleBookTable = (table: TableEntity) => {
    setSelectedTable(table);
    setBookingModalState("create");
  };

  /** Xác nhận đặt bàn */
  const handleConfirmBooking = async (data: BookingData) => {
    if (!selectedTable) return;

    const payload = {
      reservationTime: data.reservationTime,
      numberOfPeople: parseInt(data.numberOfPeople),
      note: data.note || "",
      tableIds: [selectedTable.id],
    };

    try {
      setLoading(true);
      const response = await createMyReservation(payload);

      if (response) {
        notify(
          "success",
          `Đã đặt bàn ${selectedTable.name} thành công vào lúc ${data.reservationTime}!`
        );
        setBookingModalState(null);
        await fetchMyReservations();
      } else {
        notify("error", "Không thể đặt bàn, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi gọi API đặt bàn:", error);
      notify("error", "⚠️ Có lỗi xảy ra khi đặt bàn!");
    } finally {
      setLoading(false);
    }
  };

  /** -------------------------------
   *  DERIVED DATA (FILTER / COUNT)
   *  ------------------------------- */
  const filteredTables =
    selectedArea === "ALL"
      ? tables
      : tables.filter((t) => t.locationName === selectedArea);

  const availableCount = tables.filter(
    (t) => t.statusName === "AVAILABLE"
  ).length;

  const bookedCount = tables.filter(
    (t) =>
      t.statusName === "PENDING" ||
      t.statusName === "CONFIRMED" ||
      t.statusName === "OCCUPIED"
  ).length;

  const areas = ["ALL", ...new Set(tables.map((t) => t.locationName))];

  /** -------------------------------
   *  RENDER UI
   *  ------------------------------- */
  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto bg-white p-8 md:p-10 shadow-lg rounded-xl">
        {/* === HEADER === */}
        <header className="mb-8 border-b pb-3">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Đặt bàn</h1>

          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Spinner size="xl" color="warning" />
            </div>
          ) : (
            <>
              {/* Bộ lọc khu vực */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                {/* Khu vực */}
                <div className="flex gap-2 flex-wrap">
                  {areas.map((area) => (
                    <Button
                      key={area}
                      color={selectedArea === area ? "yellow" : "blue"}
                      size="sm"
                      onClick={() => setSelectedArea(area)}>
                      {area === "ALL"
                        ? "Tất cả khu vực"
                        : translateLocation(area)}
                    </Button>
                  ))}
                </div>

                {/* Bộ đếm + nút xem danh sách */}
                <div className="flex gap-4 items-center">
                  <div className="text-sm flex gap-4 p-2 rounded-lg bg-gray-50 border">
                    <p>
                      Trống:{" "}
                      <span className="font-bold text-green-600">
                        {availableCount}
                      </span>
                    </p>
                    <p>
                      Đã đặt:{" "}
                      <span className="font-bold text-red-600">
                        {bookedCount}
                      </span>
                    </p>
                    <p>
                      Tổng: <span className="font-bold">{tables.length}</span>
                    </p>
                  </div>
                  <Button
                    color="yellow"
                    size="sm"
                    onClick={() => {
                      setShowBookedList(true);
                      fetchMyReservations();
                    }}>
                    Xem bàn đã đặt
                  </Button>
                </div>
              </div>

              {/* Chú thích */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700 items-center">
                <span className="font-semibold mr-2">Chú thích:</span>
                <Legend color="green" label="Còn trống" />
                <Legend color="red" label="Đã được đặt" />
                <Legend color="yellow" label="Bàn đang chờ duyệt" />
                <Legend color="blue" label="Bàn của tôi" />
              </div>
            </>
          )}
        </header>

        {/* === DANH SÁCH BÀN === */}
        {!loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredTables.map((table) => {
              const myStatus = myBookedStatusMap[table.id];
              const isMyBooked = !!myStatus;
              const isOtherBooked =
                !isMyBooked &&
                ["PENDING", "CONFIRMED", "OCCUPIED"].includes(table.statusName);

              const { colorClass, statusText } = getTableStatusClass(
                table,
                myStatus, // truyền status thay vì true/false
                isOtherBooked,
                translateStatus
              );

              return (
                <Tooltip
                  key={table.id}
                  content={
                    <div className="text-left space-y-1 p-1">
                      <p className="font-bold">{table.name}</p>
                      <p className="text-sm">Sức chứa: {table.capacity}</p>
                      <p className="text-sm">
                        Khu vực: {translateLocation(table.locationName)}
                      </p>
                      <p className="text-sm">
                        Vị trí: {translatePosition(table.positionName)}
                      </p>
                      <p className="text-sm">Trạng thái: {statusText}</p>
                    </div>
                  }>
                  <button
                    disabled={
                      isMyBooked ||
                      isOtherBooked ||
                      table.statusName !== "AVAILABLE"
                    }
                    onClick={() => handleBookTable(table)}
                    className={`p-4 rounded-lg border-2 text-center shadow-md transition transform hover:scale-105 ${colorClass}`}>
                    <p className="font-bold text-lg">{table.shortName}</p>
                    <p className="text-sm font-medium">{table.capacity} chỗ</p>
                    <p className="text-xs mt-1 opacity-80">
                      {translateLocation(table.locationName)}
                    </p>
                  </button>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* === MODAL ĐẶT BÀN / CẬP NHẬT === */}
        <BookingModal
          table={selectedTable}
          show={bookingModalState !== null}
          minDateTime={minDateTime}
          onClose={() => {
            setBookingModalState(null);
            setEditingReservation(null);
          }}
          onConfirm={handleConfirmBooking}
          onConfirmEdit={handleUpdateReservation}
          existingReservation={editingReservation}
          mode={bookingModalState === "edit" ? "edit" : "create"}
        />

        {/* === MODAL DANH SÁCH BÀN ĐÃ ĐẶT === */}
        <BookedListModal
          show={showBookedList}
          onClose={() => setShowBookedList(false)}
          reservations={activeReservations}
          tables={tables}
          loading={loadingReservations}
          onEdit={handleEditReservation}
          onCancel={handleCancelReservation}
          translateStatus={translateStatus}
        />
      </div>
      {/* === CONFIRM DIALOG === */}
      <ConfirmDialog
        open={showConfirm}
        title="Xác nhận hủy đặt bàn"
        message="Bạn có chắc chắn muốn hủy đặt bàn này không?"
        confirmText="Đồng ý"
        cancelText="Thoát"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </section>
  );
}

/** -------------------------------
 *  SUB COMPONENTS & HELPERS
 *  ------------------------------- */

/** Chú thích màu */
function Legend({ color, label }: { color: string; label: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 border-green-300",
    red: "bg-red-200 border-red-400",
    blue: "bg-blue-200 border-blue-400",
    yellow: "bg-yellow-200 border-yellow-400",
  };
  return (
    <div className="flex items-center gap-1">
      <span className={`w-4 h-4 rounded-full border ${colorMap[color]}`}></span>
      <span>{label}</span>
    </div>
  );
}

/** Helper xác định class & status text theo trạng thái bàn */
function getTableStatusClass(
  table: TableEntity,
  myStatus: string | undefined, // PENDING / CONFIRMED / undefined
  isOtherBooked: boolean,
  translateStatus: (s: string) => string
) {
  if (myStatus === "CONFIRMED") {
    return {
      colorClass:
        "bg-blue-100 border-blue-400 text-blue-800 cursor-not-allowed",
      statusText: "Bạn đã đặt bàn (Đã duyệt)",
    };
  }

  if (myStatus === "PENDING") {
    return {
      colorClass:
        "bg-yellow-200 border-yellow-400 text-yellow-800 cursor-not-allowed",
      statusText: "Bạn đã đặt bàn (Đang chờ duyệt)",
    };
  }

  if (isOtherBooked) {
    return {
      colorClass: "bg-red-200 border-red-400 text-gray-600 cursor-not-allowed",
      statusText: "Đã có người đặt",
    };
  }

  if (table.statusName === "AVAILABLE") {
    return {
      colorClass:
        "bg-green-100 border-green-300 hover:bg-green-200 text-green-800 hover:shadow-md",
      statusText: "Còn trống",
    };
  }

  return {
    colorClass: "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed",
    statusText: translateStatus(table.statusName),
  };
}

function getStatusNameFromId(statusId: number) {
  switch (statusId) {
    case 11:
      return "AVAILABLE";
    case 12:
      return "OCCUPIED";
    default:
      return "AVAILABLE";
  }
}
