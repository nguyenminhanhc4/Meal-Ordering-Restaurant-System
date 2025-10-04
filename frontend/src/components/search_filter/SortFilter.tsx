import React from "react";
import { Dropdown, DropdownItem } from "flowbite-react";

interface SortFilterProps {
  sort: string;
  setSort: (value: string) => void;
}

const SortFilter: React.FC<SortFilterProps> = ({ sort, setSort }) => {
  return (
    <Dropdown
      label={`Sắp xếp: ${
        sort === "price-asc"
          ? "Giá thấp đến cao"
          : sort === "price-desc"
          ? "Giá cao đến thấp"
          : sort === "newest"
          ? "Mới nhất"
          : "Phổ biến"
      }`}
      size="sm"
      color="gray"
      className="shadow-lg border !text-yellow-600 hover:!text-yellow-700 focus:ring-2 focus:!ring-yellow-400"
      theme={{
        floating: {
          target: "!bg-white !border-stone-300 !text-yellow-600",
        },
      }}>
      <DropdownItem onClick={() => setSort("popular")}>Phổ biến</DropdownItem>
      <DropdownItem onClick={() => setSort("price-asc")}>
        Giá thấp đến cao
      </DropdownItem>
      <DropdownItem onClick={() => setSort("price-desc")}>
        Giá cao đến thấp
      </DropdownItem>
      <DropdownItem onClick={() => setSort("newest")}>Mới nhất</DropdownItem>
    </Dropdown>
  );
};

export default SortFilter;
