import React, { useState, useMemo } from "react";
import { Button, Spinner } from "flowbite-react";
import { useSearchParams } from "react-router-dom";
import {
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

/**
 * Props cho component Pagination
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading?: boolean; // trạng thái loading khi chuyển trang
  onPageChange: (page: number) => void;
}

/**
 * Component Pagination
 * - Giữ trang hiện tại trong URL (?page=2)
 * - Có ô nhập “Jump to page”
 * - Hiển thị spinner khi loading
 * - Responsive bằng Tailwind (ẩn bớt khi màn hình nhỏ)
 */
const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  loading = false,
  onPageChange,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 0;
  const [inputPage, setInputPage] = useState<string>("");

  // Khi đổi trang → cập nhật URL + gọi callback
  const handlePageChange = (page: number) => {
    if (page < 0 || page >= totalPages) return;
    setSearchParams({ page: page.toString() });
    onPageChange(page);
  };

  // Khi user gõ Enter trong ô jump
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(inputPage) - 1;
    if (!isNaN(target) && target >= 0 && target < totalPages) {
      handlePageChange(target);
      setInputPage("");
    }
  };

  // Tạo danh sách các trang (rút gọn)
  const pages = useMemo(() => {
    const maxVisible = 3;
    const result: (number | string)[] = [];

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) result.push(i);
    } else {
      if (currentPage <= 1) {
        result.push(0, 1, 2, "…", totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        result.push(0, "…", totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        result.push(
          0,
          "…",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "…",
          totalPages - 1
        );
      }
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4 flex-wrap">
      {/* === Pagination Buttons === */}
      <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center">
        {/* Đầu */}
        <Button
          onClick={() => handlePageChange(0)}
          disabled={currentPage === 0 || loading}
          aria-label="Trang đầu"
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          <MdKeyboardDoubleArrowLeft />
        </Button>

        {/* Lùi */}
        <Button
          onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0 || loading}
          aria-label="Trang trước"
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          <MdKeyboardArrowLeft />
        </Button>

        {/* Số trang */}
        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
              …
            </span>
          ) : (
            <Button
              key={p}
              onClick={() => handlePageChange(p as number)}
              disabled={loading}
              aria-current={currentPage === p ? "page" : undefined}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base transition-colors duration-200 ${
                currentPage === p
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-amber-200"
              }`}>
              {loading && currentPage === p ? (
                <Spinner size="sm" />
              ) : (
                (p as number) + 1
              )}
            </Button>
          )
        )}

        {/* Tiến */}
        <Button
          onClick={() =>
            handlePageChange(Math.min(currentPage + 1, totalPages - 1))
          }
          disabled={currentPage === totalPages - 1 || loading}
          aria-label="Trang sau"
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === totalPages - 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          <MdKeyboardArrowRight />
        </Button>

        {/* Cuối */}
        <Button
          onClick={() => handlePageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || loading}
          aria-label="Trang cuối"
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === totalPages - 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          <MdKeyboardDoubleArrowRight />
        </Button>
      </div>

      {/* === Jump to Page === */}
      <form
        onSubmit={handleJumpSubmit}
        className="flex items-center gap-2 text-sm sm:text-base">
        <label htmlFor="jump" className="text-gray-700">
          Tới trang:
        </label>
        <input
          id="jump"
          type="number"
          min={1}
          max={totalPages}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-amber-400 outline-none"
        />
        <Button
          type="submit"
          disabled={!inputPage.trim() || loading}
          className="px-3 py-1 rounded-lg text-sm bg-amber-400 hover:bg-amber-500 text-white">
          Đi
        </Button>
      </form>
    </div>
  );
};

export default Pagination;
