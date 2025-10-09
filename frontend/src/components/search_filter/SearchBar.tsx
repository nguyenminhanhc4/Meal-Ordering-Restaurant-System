import React, { useEffect, useState } from "react";
import { TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";

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
    <div className="relative w-full sm:w-2/3 md:w-1/3 shadow-sm group animate-slideIn">
      {/* Icon search */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <HiSearch className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-200" />
      </div>

      {/* Ô nhập tìm kiếm */}
      <TextInput
        aria-label="Tìm kiếm món ăn"
        type="text"
        placeholder="Tìm kiếm món ăn..."
        value={tempSearch}
        onChange={(e) => setTempSearch(e.target.value)}
        className="pl-10 pr-10 shadow-lg rounded-x"
        theme={{
          field: {
            input: {
              base: "!bg-white transition-all duration-200",
              colors: {
                gray: "!bg-white border-none !text-gray-900 !placeholder-stone-500 focus:ring-2 focus:!ring-yellow-400 focus:!border-yellow-400",
              },
            },
          },
        }}
      />

      {/* Nút xoá nhanh (hiện khi có text) */}
      {tempSearch && (
        <button
          onClick={() => setTempSearch("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center 
                     text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Xoá nội dung tìm kiếm">
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
