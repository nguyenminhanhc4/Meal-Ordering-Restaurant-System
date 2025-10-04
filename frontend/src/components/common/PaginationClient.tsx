import React from "react";
import { Button } from "flowbite-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null; // Không cần hiển thị nếu chỉ có 1 trang

  return (
    <div className="flex justify-center mt-8">
      <div className="flex gap-2 items-center">
        {/* First */}
        <Button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          « First
        </Button>

        {/* Prev */}
        <Button
          onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
          disabled={currentPage === 0}
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          ‹ Prev
        </Button>

        {/* Numbered pages */}
        {Array.from({ length: totalPages }, (_, idx) => {
          const pageNum = idx + 1;
          const isActive = currentPage + 1 === pageNum;
          return (
            <Button
              key={pageNum}
              onClick={() => onPageChange(idx)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-amber-200"
              }`}>
              {pageNum}
            </Button>
          );
        })}

        {/* Next */}
        <Button
          onClick={() =>
            onPageChange(Math.min(currentPage + 1, totalPages - 1))
          }
          disabled={currentPage === totalPages - 1}
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === totalPages - 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          Next ›
        </Button>

        {/* Last */}
        <Button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
            currentPage === totalPages - 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-amber-200"
          }`}>
          Last »
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
