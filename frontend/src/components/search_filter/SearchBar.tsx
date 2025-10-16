import React, { useEffect, useState } from "react";
import { HiSearch, HiX } from "react-icons/hi";

/**
 * Props cho SearchBar component
 */
interface SearchBarProps {
  /** Giá trị chuỗi tìm kiếm hiện tại */
  search: string;
  /** Hàm cập nhật giá trị tìm kiếm trong component cha */
  setSearch: (value: string) => void;
}

/**
 * Component thanh tìm kiếm món ăn với:
 * - Debounce khi nhập để tránh gọi API liên tục
 * - Nút xoá nhanh
 * - Cải thiện UI/UX (focus, hover, responsive)
 * - Hỗ trợ accessibility
 */
const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  // State tạm để debounce input
  const [tempSearch, setTempSearch] = useState(search);

  /**
   * useEffect: Delay cập nhật search chính sau 400ms
   * tránh gọi API liên tục khi người dùng đang gõ
   */
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(tempSearch.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [tempSearch, setSearch]);

  return (
    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200 shadow-sm w-full sm:w-2/3 md:w-1/3">
      {/* Icon search */}
      <HiSearch className="w-5 h-5 text-yellow-600" />

      {/* Input tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kiếm món ăn..."
        value={tempSearch}
        onChange={(e) => setTempSearch(e.target.value)}
        className="flex-1 border-yellow-300 placeholder-stone-500 text-sm outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg px-2 py-1 transition"
        aria-label="Tìm kiếm món ăn"
      />

      {/* Nút xoá nhanh */}
      {tempSearch && (
        <button
          onClick={() => setTempSearch("")}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Xoá nội dung tìm kiếm">
          <HiX className="w-5 h-5 text-yellow-600" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
