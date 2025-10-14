import React from "react";
import { Badge } from "flowbite-react";
import { HiTrendingUp, HiTrendingDown, HiFire, HiExclamation } from "react-icons/hi";
import type { MenuItemSalesDto } from "../../services/types/statistics.types";

interface TopSellingItemsProps {
  items: MenuItemSalesDto[];
  title: string;
  type: "best" | "worst";
  loading?: boolean;
}

const TopSellingItems: React.FC<TopSellingItemsProps> = ({
  items,
  title,
  type,
  loading = false,
}) => {
  if (loading) {
    return (
      <div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 mb-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {type === "best" ? (
            <HiFire className="w-6 h-6 text-orange-500" />
          ) : (
            <HiExclamation className="w-6 h-6 text-yellow-500" />
          )}
          {title}
        </h3>
        <Badge
          color={type === "best" ? "success" : "warning"}
          className="px-3 py-1"
        >
          {type === "best" ? (
            <div className="flex items-center gap-1">
              <HiTrendingUp className="w-4 h-4" />
              <span className="font-semibold">Top {items.length}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <HiTrendingDown className="w-4 h-4" />
              <span className="font-semibold">Cần cải thiện</span>
            </div>
          )}
        </Badge>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.menuItemId}
            className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 border ${
              type === "best"
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-md"
                : "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:shadow-md"
            } hover:scale-[1.02] cursor-pointer`}
          >
            {/* Rank Badge */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shadow-md ${
                index === 0
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
                  : index === 1
                  ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                  : index === 2
                  ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                  : "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
              }`}
            >
              {index + 1}
            </div>

            {/* Item Image */}
            <div className="flex-shrink-0">
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.menuItemName}
                  className="w-16 h-16 rounded-xl object-cover shadow-md border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-md">
                  <span className="text-gray-400 text-xs font-semibold">
                    No img
                  </span>
                </div>
              )}
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-gray-900 truncate mb-1">
                {item.menuItemName}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Đã bán:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {item.totalQuantitySold}
                  </span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Doanh thu:</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {item.totalRevenue.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Icon */}
            <div className="flex-shrink-0">
              {type === "best" ? (
                <div className="bg-green-100 p-2 rounded-lg">
                  <HiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="bg-orange-100 p-2 rounded-lg">
                  <HiTrendingDown className="w-6 h-6 text-orange-600" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopSellingItems;
