import React from "react";
import { FaFilter } from "react-icons/fa";

interface SortFilterProps {
  sort: string;
  setSort: (value: string) => void;
  resetPage?: () => void;
}

const SortFilter: React.FC<SortFilterProps> = ({
  sort,
  setSort,
  resetPage,
}) => {
  const sortOptions = [
    { key: "popular", label: "Phổ biến" },
    { key: "price-asc", label: "Giá thấp đến cao" },
    { key: "price-desc", label: "Giá cao đến thấp" },
    { key: "newest", label: "Mới nhất" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    resetPage?.();
  };

  return (
    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200 shadow-sm w-full md:max-w-xs">
      <FaFilter className="w-5 h-5 text-yellow-600" />

      <select
        className="flex-1 border border-yellow-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-yellow-400 outline-none transition"
        value={sort}
        onChange={handleChange}
        aria-label="Chọn phương thức sắp xếp">
        {sortOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortFilter;
