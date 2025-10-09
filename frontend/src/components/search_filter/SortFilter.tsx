import React, { useMemo } from "react";
import { Dropdown, DropdownItem } from "flowbite-react";
import {
  HiArrowUp,
  HiArrowDown,
  HiClock,
  HiFire,
  HiCheck,
} from "react-icons/hi";

/**
 * Props cho SortFilter component
 */
interface SortFilterProps {
  sort: string;
  setSort: (value: string) => void;
  resetPage?: () => void; // Tuỳ chọn: reset về trang 1 khi đổi sort
}

/**
 * Component dropdown sắp xếp món ăn
 * - Có icon trực quan
 * - Hiển thị trạng thái được chọn
 * - Tối ưu re-render và accessibility
 */
const SortFilter: React.FC<SortFilterProps> = ({
  sort,
  setSort,
  resetPage,
}) => {
  // useMemo để không khởi tạo lại mỗi lần render
  const sortOptions = useMemo(
    () => [
      { key: "popular", label: "Phổ biến", icon: <HiFire className="mr-2" /> },
      {
        key: "price-asc",
        label: "Giá thấp đến cao",
        icon: <HiArrowUp className="mr-2" />,
      },
      {
        key: "price-desc",
        label: "Giá cao đến thấp",
        icon: <HiArrowDown className="mr-2" />,
      },
      { key: "newest", label: "Mới nhất", icon: <HiClock className="mr-2" /> },
    ],
    []
  );

  // Nhãn hiện tại
  const currentSort =
    sortOptions.find((s) => s.key === sort)?.label || "Phổ biến";

  // Hàm đổi sort (và reset page nếu có)
  const handleSortChange = (value: string) => {
    setSort(value);
    resetPage?.(); // chỉ gọi nếu được truyền từ parent
  };

  return (
    <Dropdown
      label={`Sắp xếp: ${currentSort}`}
      size="sm"
      color="gray"
      dismissOnClick={true}
      aria-label="Lựa chọn sắp xếp món ăn"
      className="shadow-md !bg-white border !text-yellow-700 hover:!text-yellow-800 focus:ring-2 focus:!ring-yellow-400 duration-200"
      theme={{
        floating: {
          base: "!rounded-xl !border-stone-300 !bg-white",
          item: {
            base: "flex items-center px-4 py-2 text-sm hover:!bg-yellow-100 !text-stone-800 cursor-pointer duration-150 rounded-md",
          },
        },
      }}>
      {sortOptions.map((option) => (
        <DropdownItem
          key={option.key}
          onClick={() => handleSortChange(option.key)}
          aria-selected={sort === option.key}
          title={`Sắp xếp theo ${option.label}`}
          className={`flex items-center ${
            sort === option.key
              ? "font-semibold !text-yellow-700 bg-yellow-50"
              : ""
          }`}>
          {option.icon}
          {option.label}
          {sort === option.key && (
            <HiCheck className="ml-auto !text-yellow-500" />
          )}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export default SortFilter;
