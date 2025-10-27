import React from "react";
import { FaFilter } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const sortOptions = [
    { key: "popular", label: t("component.sortFilter.popular") },
    { key: "price-asc", label: t("component.sortFilter.priceAsc") },
    { key: "price-desc", label: t("component.sortFilter.priceDesc") },
    { key: "newest", label: t("component.sortFilter.newest") },
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
        aria-label={t("component.sortFilter.ariaLabel")}>
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
