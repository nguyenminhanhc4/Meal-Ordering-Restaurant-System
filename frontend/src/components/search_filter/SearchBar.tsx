import React from "react";
import { TextInput } from "flowbite-react";
import { HiSearch } from "react-icons/hi";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ search, setSearch }) => {
  return (
    <div className="relative w-full md:w-1/3 shadow-sm group animate-slideIn">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <HiSearch className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700" />
      </div>
      <TextInput
        type="text"
        placeholder="Tìm kiếm món ăn..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 shadow-lg !bg-white !border-stone-300 focus:ring-2 focus:!ring-yellow-400"
        theme={{
          field: {
            input: {
              base: "!bg-white !border-stone-300",
              colors: {
                gray: "!bg-white !border-stone-300 !text-gray-900 !placeholder-stone-500",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default SearchBar;
