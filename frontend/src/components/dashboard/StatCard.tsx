import React from "react";
import {
  HiTrendingUp,
  HiTrendingDown,
  HiCurrencyDollar,
  HiShoppingCart,
} from "react-icons/hi";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: "revenue" | "orders" | "avg" | "growth";
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  loading = false,
}) => {
  const getIcon = () => {
    const iconClass = "h-10 w-10";
    switch (icon) {
      case "revenue":
        return <HiCurrencyDollar className={`${iconClass} text-emerald-500`} />;
      case "orders":
        return <HiShoppingCart className={`${iconClass} text-blue-500`} />;
      case "avg":
        return <HiCurrencyDollar className={`${iconClass} text-purple-500`} />;
      case "growth":
        return change && change >= 0 ? (
          <HiTrendingUp className={`${iconClass} text-green-500`} />
        ) : (
          <HiTrendingDown className={`${iconClass} text-red-500`} />
        );
    }
  };

  const getGradient = () => {
    switch (icon) {
      case "revenue":
        return "from-emerald-50 to-teal-50 border-emerald-200";
      case "orders":
        return "from-blue-50 to-indigo-50 border-blue-200";
      case "avg":
        return "from-purple-50 to-pink-50 border-purple-200";
      case "growth":
        return change && change >= 0
          ? "from-green-50 to-emerald-50 border-green-200"
          : "from-red-50 to-pink-50 border-red-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      if (icon === "revenue" || icon === "avg") {
        return val.toLocaleString("vi-VN") + " ₫";
      }
      return val.toLocaleString("vi-VN");
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br ${getGradient()} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border transform hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">
            {formatValue(value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center text-sm">
              {change >= 0 ? (
                <>
                  <HiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-semibold">
                    +{change.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <HiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-red-600 font-semibold">
                    {change.toFixed(1)}%
                  </span>
                </>
              )}
              <span className="ml-2 text-gray-500">so với tháng trước</span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 bg-white bg-opacity-50 p-3 rounded-xl">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
