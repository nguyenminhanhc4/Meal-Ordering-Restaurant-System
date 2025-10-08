// src/pages/table/TableSeatMap.tsx
import { useEffect, useState } from "react";
import { getAllTables, type Table } from "../../../services/table/tableService";
import { Tooltip } from "flowbite-react";

export default function TableSeatMap() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  useEffect(() => {
    getAllTables().then(setTables);
  }, []);

  const handleSelect = (table: Table) => {
    if (table.statusName === "OCCUPIED") return;
    setSelectedTableId((prev) => (prev === table.id ? null : table.id));
  };

  const getColor = (table: Table) => {
    if (table.statusName === "OCCUPIED") return "bg-red-500 cursor-not-allowed";
    if (table.id === selectedTableId) return "bg-blue-500 ring-4 ring-blue-300";
    return "bg-green-500 hover:bg-green-600";
  };

  const selectedTable = tables.find((t) => t.id === selectedTableId);

  return (
    <section className="w-full min-h-screen flex flex-col items-center bg-gray-50 py-10">
      <div className="max-w-screen-xl mx-auto py-12 px-4 md:px-6">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Sơ đồ bàn (Seat Map)
          </h1>
          <p className="text-gray-500">
            Chọn bàn bạn muốn đặt. Màu sắc thể hiện trạng thái bàn.
          </p>
        </header>

        {/* Khu vực sơ đồ bàn */}
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-5xl flex flex-col items-center">
          <div className="grid grid-cols-6 gap-5 p-6 bg-gray-100 rounded-2xl shadow-inner">
            {tables.map((table) => (
              <Tooltip
                key={table.id}
                content={`${table.name} • ${table.capacity} người`}>
                <button
                  disabled={table.statusName === "OCCUPIED"}
                  onClick={() => handleSelect(table)}
                  className={`w-16 h-16 text-white font-bold rounded-xl transition-all duration-200 shadow-md ${getColor(
                    table
                  )}`}>
                  {table.name}
                </button>
              </Tooltip>
            ))}
          </div>

          {/* Chú thích trạng thái */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />{" "}
              <span>Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />{" "}
              <span>Đang đặt</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded" />{" "}
              <span>Đã chọn</span>
            </div>
          </div>

          {/* Bàn được chọn */}
          {selectedTable && (
            <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6 w-80 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Bàn được chọn
              </h2>
              <p className="text-gray-600 mb-1">
                <span className="font-medium">{selectedTable.name}</span>
              </p>
              <p className="text-gray-500 text-sm">
                Sức chứa: {selectedTable.capacity} người
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
