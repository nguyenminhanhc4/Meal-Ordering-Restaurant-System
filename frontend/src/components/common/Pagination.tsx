import React from 'react';
import { Button } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize
}) => {
  // Generate array of page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Always show first page
        i === totalPages || // Always show last page
        (i >= currentPage - delta && i <= currentPage + delta) // Show pages around current page
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          // If there's just one number between, show it
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          // If there's more than one number between, show dots
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          color="gray"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <HiChevronLeft className="h-5 w-5" />
        </Button>

        {getPageNumbers().map((pageNumber, index) => (
          <Button
            key={index}
            size="sm"
            color={pageNumber === currentPage ? 'info' : 'gray'}
            disabled={pageNumber === '...'}
            onClick={() => {
              if (typeof pageNumber === 'number') {
                onPageChange(pageNumber);
              }
            }}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          size="sm"
          color="gray"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <HiChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {totalItems !== undefined && pageSize !== undefined && (
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * pageSize, totalItems)}
          </span>{' '}
          of <span className="font-medium">{totalItems}</span> entries
        </div>
      )}
    </div>
  );
};

export default Pagination;