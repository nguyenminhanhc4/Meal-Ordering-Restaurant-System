import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Spinner,
  Tooltip,
  ModalHeader,
  ModalBody,
} from "flowbite-react";
import { getAllTables } from "../../../services/table/tableService";
import type { Table } from "../../../services/table/tableService";
import BookingModal, { type BookingData } from "./BookingModal";

export default function TableBooking() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [bookedTables, setBookedTables] = useState<number[]>([]);
  const [showBookedList, setShowBookedList] = useState(false);
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  useEffect(() => {
    getAllTables().then((data) => {
      setTables(data);
      setLoading(false);
    });
  }, []);

  /** ✅ Mapping sang tiếng Việt */
  const translateLocation = (location: string) => {
    const map: Record<string, string> = {
      MAIN_HALL: "Sảnh chính",
      VIP_ROOM: "Phòng VIP",
      OUTDOOR: "Ngoài trời",
      GARDEN: "Khu vườn",
      PRIVATE_ROOM: "Phòng riêng",
      BAR_AREA: "Quầy bar",
    };
    return map[location] || location;
  };

  const translatePosition = (position: string) => {
    const map: Record<string, string> = {
      CENTER: "Giữa sảnh",
      FAMILY: "Gia đình",
      GOOD_VIEW: "Cảnh đẹp",
      BAR: "Quầy bar",
      VIP: "Khu vực VIP",
      PERSONAL: "Cá nhân/ riêng tư",
    };
    return map[position] || position;
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      AVAILABLE: "Còn trống",
      OCCUPIED: "Đang sử dụng",
    };
    return map[status] || status;
  };

  /** ✅ Xử lý đặt bàn */
  const handleBookTable = (table: Table) => {
    setSelectedTable(table);
    setOpenModal(true);
  };

  // ✅ Hàm xác nhận mới nhận dữ liệu form từ BookingModal
  const confirmBooking = (data: BookingData) => {
    if (!selectedTable) return;

    // Ở đây, bạn sẽ gọi API để tạo reservation
    console.log("Dữ liệu đặt bàn để gửi API:", {
      ...data,
      tableId: selectedTable.id,
      // Chuyển đổi số người từ string sang number
      numberOfPeople: parseInt(data.numberOfPeople),
    });

    setBookedTables((prev) => [...prev, selectedTable.id]);
    setOpenModal(false);

    alert(
      `✅ Đã đặt bàn ${selectedTable.name} thành công cho ${data.name} vào lúc ${data.reservationTime}!`
    );
  };

  /** ✅ Bộ lọc */
  const filteredTables =
    selectedArea === "ALL"
      ? tables
      : tables.filter((t) => t.locationName === selectedArea);

  // Thêm điều kiện check bookedTables vào availableCount
  const availableCount = tables.filter(
    (t) => !bookedTables.includes(t.id) && t.statusName === "AVAILABLE"
  ).length;

  const bookedCount = bookedTables.length;

  const areas = [
    "ALL",
    ...Array.from(new Set(tables.map((t) => t.locationName))),
  ];

  /** ✅ Giao diện */
  /** ✅ Giao diện */
  return (
    <section className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6 bg-white shadow-lg rounded-xl">
        {/* === SECTION 1: Header + Bộ lọc khu vực + Bộ đếm === */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-2">
            Quản lý Đặt bàn
          </h1>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <Spinner size="xl" color="warning" />
            </div>
          ) : (
            <>
              {/* Bộ lọc khu vực: Bố cục linh hoạt hơn */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                {/* Các nút bộ lọc */}
                <div className="flex gap-2 flex-wrap">
                  {areas.map((area) => (
                    <Button
                      key={area}
                      color={selectedArea === area ? "yellow" : "blue"}
                      onClick={() => setSelectedArea(area)}
                      size="sm">
                      {area === "ALL"
                        ? "Tất cả khu vực"
                        : translateLocation(area)}
                    </Button>
                  ))}
                </div>

                {/* Bộ đếm bàn và nút xem danh sách */}
                <div className="flex gap-4 items-center">
                  <div className="text-sm flex gap-4 p-2 rounded-lg bg-gray-50 border">
                    <p className="text-gray-700">
                      Trống:{" "}
                      <span className="font-bold text-green-600">
                        {availableCount}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Đã đặt:{" "}
                      <span className="font-bold text-red-600">
                        {bookedCount}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Tổng: <span className="font-bold">{tables.length}</span>
                    </p>
                  </div>
                  {/* ✅ BỔ SUNG: Nút hiển thị danh sách bàn đã đặt */}
                  <Button
                    color="yellow"
                    size="sm"
                    onClick={() => setShowBookedList(true)}
                    disabled={bookedTables.length === 0}>
                    Xem danh sách bàn đã đặt
                  </Button>
                </div>
              </div>

              {/* ✅ PHẦN BỔ SUNG: Chú thích màu sắc (Legend) */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700 items-center">
                <span className="font-semibold mr-2">Chú thích:</span>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-green-100 border border-green-300"></span>
                  <span>**Còn trống**</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded-full bg-red-200 border border-red-400"></span>
                  <span>**Đã đặt**</span>
                </div>
              </div>
            </>
          )}
        </header>

        <hr className="mb-6" />

        {/* === SECTION 2: Grid bàn (Giữ nguyên) === */}
        {!loading && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {filteredTables.map((table) => {
              const isBooked = bookedTables.includes(table.id);
              // Xác định màu sắc dựa trên trạng thái (Booked > Available)
              let buttonColorClass =
                "bg-red-200 border-red-400 text-gray-500 cursor-not-allowed"; // Mặc định là Đã đặt
              let statusTextClass = "text-red-500";
              let statusText = "Đã đặt";

              if (!isBooked) {
                // Kiểm tra trạng thái thực tế nếu chưa được đặt
                if (table.statusName === "AVAILABLE") {
                  buttonColorClass =
                    "bg-green-100 border-green-300 hover:bg-green-200 text-green-800 hover:shadow-md";
                  statusTextClass = "text-green-600";
                  statusText = translateStatus(table.statusName);
                } else {
                  // OCCUPIED/CLEANING/v.v.
                  buttonColorClass =
                    "bg-amber-100 border-amber-300 text-amber-800 cursor-not-allowed";
                  statusTextClass = "text-amber-600";
                  statusText = translateStatus(table.statusName);
                }
              }

              return (
                <Tooltip
                  key={table.id}
                  content={
                    <div className="text-left space-y-1 p-1">
                      <p className="font-bold text-base">
                        {table.name} ({table.shortName})
                      </p>
                      <p className="text-sm">Sức chứa: {table.capacity} chỗ</p>
                      <p className="text-sm">
                        Vị trí: {translatePosition(table.positionName)}
                      </p>
                      <p className="text-sm">
                        Khu vực: {translateLocation(table.locationName)}
                      </p>
                      <p className="text-sm">
                        Trạng thái:{" "}
                        <span className={`font-semibold ${statusTextClass}`}>
                          {statusText}
                        </span>
                      </p>
                    </div>
                  }>
                  <button
                    disabled={isBooked || table.statusName !== "AVAILABLE"}
                    onClick={() => handleBookTable(table)}
                    className={`
                      p-4 rounded-lg border-2 text-center shadow-md transition transform hover:scale-105
                      ${buttonColorClass}
                    `}>
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

        {/* === SECTION 4: BookingModal (Giữ nguyên) === */}
        <BookingModal
          table={selectedTable}
          open={openModal}
          minDateTime={minDateTime}
          onClose={() => setOpenModal(false)}
          onConfirm={confirmBooking}
        />

        {/* === SECTION 5: Modal danh sách bàn đã đặt (Giữ nguyên) === */}
        <Modal
          show={showBookedList}
          onClose={() => setShowBookedList(false)}
          popup>
          <ModalHeader className="border-b-8 !border-yellow-800 !bg-stone-800">
            <div className="text-xl font-normal text-yellow-500 mt-1">
              Danh sách bàn đã đặt
            </div>
          </ModalHeader>
          <ModalBody className="bg-slate-200">
            {bookedTables.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Chưa có bàn nào được đặt
              </p>
            ) : (
              <ul className="list-disc pl-6 space-y-2 pt-4">
                {bookedTables.map((id) => {
                  const table = tables.find((t) => t.id === id);
                  return (
                    <li key={id} className="text-black">
                      <span className="font-semibold">{table?.name}</span> -{" "}
                      {translateLocation(table?.locationName || "")}
                      <span className="text-sm text-gray-800">
                        {" "}
                        ({translatePosition(table?.positionName || "")},{" "}
                        {table?.capacity} chỗ)
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </ModalBody>
        </Modal>
      </div>
    </section>
  );
}
