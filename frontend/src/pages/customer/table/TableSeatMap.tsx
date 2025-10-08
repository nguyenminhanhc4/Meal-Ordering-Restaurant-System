import { useEffect, useState } from "react";
import { getAllTables, type Table } from "../../../services/table/tableService";
import {
  Tooltip,
  Button,
  ModalHeader,
  ModalBody,
  Modal,
  Label,
  TextInput,
  Textarea,
} from "flowbite-react";

export default function TableSeatMap() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [bookedTableIds, setBookedTableIds] = useState<number[]>([]);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false); // 🔹 Trạng thái mở modal
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfPeople: 1,
    note: "",
  });

  useEffect(() => {
    getAllTables().then(setTables);
  }, []);

  const handleSelect = (table: Table) => {
    if (table.statusName === "OCCUPIED") return;
    setSelectedTableId((prev) => (prev === table.id ? null : table.id));
    setActiveLocation(table.locationName || "Khu khác");
  };

  /** 🔹 Khi nhấn “Đặt bàn” → mở modal */
  const handleOpenBookForm = () => {
    if (!selectedTableId) return;
    setOpenModal(true);
  };

  /** 🔹 Gửi form đặt bàn */
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Giả lập đặt bàn thành công
    setBookedTableIds((prev) =>
      prev.includes(selectedTableId!) ? prev : [...prev, selectedTableId!]
    );

    alert(
      `✅ Đặt bàn ${selectedTable?.name} thành công cho ${formData.name} (${formData.numberOfPeople} người)`
    );

    setOpenModal(false);
    setSelectedTableId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      numberOfPeople: 1,
      note: "",
    });
  };

  const LOCATION_NAME_MAP: Record<string, string> = {
    MAIN_HALL: "Sảnh chính",
    OUTDOOR: "Sân vườn",
    VIP_ROOM: "Phòng VIP",
    PRIVATE_ROOM: "Phòng riêng",
    BAR_AREA: "Khu quầy bar",
  };

  const POSITION_NAME_MAP: Record<string, string> = {
    VIP: "Bàn VIP",
    GOOD_VIEW: "Bàn view đẹp",
    PERSONAL: "Bàn riêng tư",
    FAMILY: "Bàn gia đình",
    BAR: "Bàn quầy bar",
    CENTER: "Bàn trung tâm",
  };

  const STATUS_NAME_MAP: Record<string, string> = {
    AVAILABLE: "Còn trống",
    OCCUPIED: "Đang có khách",
  };

  const handleCancelBooking = (tableId: number) => {
    setBookedTableIds((prev) => prev.filter((id) => id !== tableId));
    alert(
      `❌ Bạn đã hủy đặt bàn ${tables.find((t) => t.id === tableId)?.name}`
    );
  };

  /** Đảm bảo màu sắc nhất quán với bảng chú thích */
  const getColor = (table: Table) => {
    if (table.statusName === "OCCUPIED") return "bg-red-500 cursor-not-allowed"; // Đang có khách
    if (bookedTableIds.includes(table.id))
      return "bg-blue-500 ring-4 ring-blue-300"; // Đã đặt
    if (table.id === selectedTableId)
      return "bg-yellow-400 ring-4 ring-yellow-300"; // Đang chọn
    return "bg-green-500 hover:bg-green-600"; // Trống
  };

  const groupedTables = tables.reduce((acc, table) => {
    const location = table.locationName || "Khu khác";
    if (!acc[location]) acc[location] = [];
    acc[location].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  // ======================================
  // JSX Render
  // ======================================
  return (
    <section className="w-full min-h-screen flex flex-col items-center bg-gray-50 py-10 relative">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Sơ đồ bàn (Seat Map)
          </h1>
          <p className="text-gray-500">
            Màu sắc thể hiện trạng thái: trống, đang xem, đã đặt, có khách.
          </p>
        </header>

        {Object.entries(groupedTables).map(([location, tablesInArea]) => {
          const isActive = activeLocation === location;

          // Lấy mô tả khu vực từ bàn đầu tiên (hoặc tùy chỉnh riêng)
          const locationDesc =
            tablesInArea[0]?.locationDescription &&
            tablesInArea[0]?.locationDescription !== location
              ? tablesInArea[0].locationDescription
              : "Không có mô tả";

          return (
            <div
              key={location}
              className={`mb-10 bg-white rounded-2xl shadow-md p-6 md:p-8 transition-all ${
                isActive ? "ring-2 ring-yellow-300" : ""
              }`}>
              {/* Header khu vực */}
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-700 flex items-center justify-between">
                  <span>{LOCATION_NAME_MAP[location] || location}</span>
                  <span className="text-sm text-gray-500">{locationDesc}</span>
                </h2>
                <div className="border-b border-gray-200 mt-2"></div>
              </div>

              {/* Grid bàn */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 justify-items-center">
                {tablesInArea.map((table) => (
                  <Tooltip
                    key={table.id}
                    content={`${table.name} • ${table.capacity} người • ${
                      POSITION_NAME_MAP[table.positionName] ||
                      table.positionName ||
                      "Không xác định vị trí"
                    }`}
                    placement="top">
                    <button
                      disabled={table.statusName === "OCCUPIED"}
                      onClick={() => handleSelect(table)}
                      className={`w-12 h-12 text-xs text-white font-semibold rounded-lg transition-all duration-200 shadow-md flex items-center justify-center ${getColor(
                        table
                      )}`}>
                      {table.shortName}
                    </button>
                  </Tooltip>
                ))}
              </div>

              {/* Thông tin chi tiết bàn khi chọn */}
              {isActive && selectedTable && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl shadow-inner">
                  <h3 className="text-lg font-semibold text-orange-700 mb-2">
                    🪑 Thông tin bàn {selectedTable.name}
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      <span className="font-medium text-gray-800">
                        Khu vực:
                      </span>{" "}
                      {LOCATION_NAME_MAP[selectedTable.locationName] ||
                        selectedTable.locationName}
                    </li>
                    <li>
                      <span className="font-medium text-gray-800">Vị trí:</span>{" "}
                      {POSITION_NAME_MAP[selectedTable.positionName] ||
                        selectedTable.positionName}
                    </li>
                    <li>
                      <span className="font-medium text-gray-800">
                        Sức chứa:
                      </span>{" "}
                      {selectedTable.capacity} người
                    </li>
                    <li>
                      <span className="font-medium text-gray-800">
                        Trạng thái:
                      </span>{" "}
                      {bookedTableIds.includes(selectedTable.id)
                        ? "Đã đặt"
                        : STATUS_NAME_MAP[selectedTable.statusName] ||
                          selectedTable.statusName}
                    </li>
                  </ul>

                  <div className="flex justify-end mt-4 gap-3">
                    {bookedTableIds.includes(selectedTable.id) ? (
                      <Button
                        color="red"
                        onClick={() => handleCancelBooking(selectedTable.id)}>
                        Hủy đặt bàn
                      </Button>
                    ) : (
                      <Button color="blue" onClick={handleOpenBookForm}>
                        Đặt bàn này
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---------- Modal Đặt bàn (Trắng Ngà/Cam) ---------- */}
      <Modal
        show={openModal}
        onClose={() => setOpenModal(false)}
        size="md"
        popup>
        {/* Điều chỉnh Header sang màu Trắng Ngà/Yellow-50 */}
        <ModalHeader className="!bg-yellow-50 border-b !border-yellow-200 rounded-t-lg">
          <span className="text-orange-700 font-semibold">
            Đặt bàn {selectedTable?.name}
          </span>
        </ModalHeader>

        <ModalBody className="!bg-white rounded-b-lg text-sm shadow-xl">
          <form onSubmit={handleSubmitBooking} className="flex flex-col gap-3">
            <div>
              <Label className="!text-gray-700">Họ và tên</Label>
              <TextInput
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                // Điều chỉnh Input sang tông Trắng Ngà/Yellow
                theme={{
                  field: {
                    input: {
                      base: "!bg-yellow-50 !border-yellow-200 !text-gray-800 focus:!border-orange-400 focus:!ring-orange-400",
                    },
                  },
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="!text-gray-700">Email</Label>
                <TextInput
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  theme={{
                    field: {
                      input: {
                        base: "!bg-yellow-50 !border-yellow-200 !text-gray-800 focus:!border-orange-400 focus:!ring-orange-400",
                      },
                    },
                  }}
                />
              </div>
              <div>
                <Label className="!text-gray-700">Số điện thoại</Label>
                <TextInput
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  theme={{
                    field: {
                      input: {
                        base: "!bg-yellow-50 !border-yellow-200 !text-gray-800 focus:!border-orange-400 focus:!ring-orange-400",
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div>
              <Label className="!text-gray-700">Số người</Label>
              <TextInput
                type="number"
                min={1}
                max={selectedTable?.capacity || 10}
                required
                value={formData.numberOfPeople}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfPeople: parseInt(e.target.value),
                  })
                }
                theme={{
                  field: {
                    input: {
                      base: "!bg-yellow-50 !border-yellow-200 !text-gray-800 focus:!border-orange-400 focus:!ring-orange-400",
                    },
                  },
                }}
              />
            </div>

            <div>
              <Label className="!text-gray-700">Ghi chú</Label>
              <Textarea
                rows={2}
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                theme={{
                  // Textarea không có field.input nên cần tùy chỉnh theme ở base
                  base: "block w-full rounded-lg border disabled:cursor-not-allowed disabled:opacity-50 !bg-yellow-50 !border-yellow-200 !text-gray-800 focus:!border-orange-400 focus:!ring-orange-400 p-2.5 text-sm",
                }}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              {/* Nút Hủy chuyển sang Xám trung tính hoặc Đỏ */}
              <Button color="red" onClick={() => setOpenModal(false)}>
                Hủy
              </Button>
              {/* Nút Xác nhận chuyển sang Cam (Orange) */}
              <Button color="green" type="submit">
                Xác nhận
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>

      {/* ---------- Floating Legend (Bảng chú thích) ---------- */}
      <div className="fixed top-24 right-6 bg-white shadow-lg rounded-xl p-4 text-sm border border-gray-200">
        <p className="font-semibold text-gray-700 mb-2">Trạng thái bàn</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" /> <span>Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded" />{" "}
            <span>Đang xem / chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded" /> <span>Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />{" "}
            <span>Đang có khách</span>
          </div>
        </div>
      </div>
    </section>
  );
}
