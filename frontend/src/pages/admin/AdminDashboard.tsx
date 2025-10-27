import { useState, useEffect } from "react";
import { Spinner, Alert, Badge } from "flowbite-react";
import { HiChartPie, HiTrendingUp, HiCalendar } from "react-icons/hi";
import StatCard from "../../components/dashboard/StatCard";
import TopSellingItems from "../../components/dashboard/TopSellingItems";
import RevenueChart from "../../components/dashboard/RevenueChart";
import StatisticsService from "../../services/statistics/StatisticsService";
import type {
  RevenueStatisticsDto,
  MenuItemSalesDto,
  DashboardStats,
} from "../../services/types/statistics.types";
import { useTranslation } from "react-i18next"; // Thêm useTranslation

function AdminDashboard() {
  const { t } = useTranslation(); // Thêm hook useTranslation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    growthRate: 0,
  });

  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<
    RevenueStatisticsDto[]
  >([]);
  const [currentYearRevenue, setCurrentYearRevenue] = useState<
    RevenueStatisticsDto[]
  >([]);

  const [activeTab, setActiveTab] = useState<"overview" | "month" | "year">(
    "overview"
  );

  const [bestSellingItems, setBestSellingItems] = useState<MenuItemSalesDto[]>(
    []
  );
  const [worstSellingItems, setWorstSellingItems] = useState<
    MenuItemSalesDto[]
  >([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [monthRevenue, yearRevenue, bestSelling, worstSelling] =
        await Promise.all([
          StatisticsService.getCurrentMonthRevenue(),
          StatisticsService.getCurrentYearRevenue(),
          StatisticsService.getCurrentMonthBestSelling(10),
          StatisticsService.getCurrentMonthWorstSelling(10),
        ]);

      setCurrentMonthRevenue(monthRevenue);
      setCurrentYearRevenue(yearRevenue);
      setBestSellingItems(bestSelling);
      setWorstSellingItems(worstSelling);

      if (monthRevenue.length > 0) {
        const totalRevenue = monthRevenue.reduce(
          (sum, item) => sum + item.totalRevenue,
          0
        );
        const totalOrders = monthRevenue.reduce(
          (sum, item) => sum + item.totalOrders,
          0
        );
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        let growthRate = 0;
        if (yearRevenue.length >= 2) {
          const currentMonth = yearRevenue[yearRevenue.length - 1];
          const previousMonth = yearRevenue[yearRevenue.length - 2];
          if (previousMonth.totalRevenue > 0) {
            growthRate =
              ((currentMonth.totalRevenue - previousMonth.totalRevenue) /
                previousMonth.totalRevenue) *
              100;
          }
        }

        setDashboardStats({
          totalRevenue,
          totalOrders,
          avgOrderValue,
          growthRate,
        });
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(t("admin.dashboard.error.fetchFailed")); // Sử dụng i18n
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert color="failure" onDismiss={() => setError(null)}>
          <span className="font-medium">
            {t("admin.dashboard.error.alertTitle")}
          </span>{" "}
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("admin.dashboard.header.title")} {/* Sử dụng i18n */}
            </h1>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Badge color="success" className="animate-pulse">
                {t("admin.dashboard.header.liveBadge")} {/* Sử dụng i18n */}
              </Badge>
              {t("admin.dashboard.header.description")} {/* Sử dụng i18n */}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>{t("admin.dashboard.refreshButton.loading")}</span>{" "}
                {/* Sử dụng i18n */}
              </>
            ) : (
              <>
                <HiChartPie className="w-5 h-5" />
                <span className="font-semibold">
                  {t("admin.dashboard.refreshButton.refresh")}
                </span>{" "}
                {/* Sử dụng i18n */}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t("admin.dashboard.stats.totalRevenue")} // Sử dụng i18n
          value={dashboardStats.totalRevenue}
          icon="revenue"
          loading={loading}
        />
        <StatCard
          title={t("admin.dashboard.stats.totalOrders")} // Sử dụng i18n
          value={dashboardStats.totalOrders}
          icon="orders"
          loading={loading}
        />
        <StatCard
          title={t("admin.dashboard.stats.avgOrderValue")} // Sử dụng i18n
          value={dashboardStats.avgOrderValue}
          icon="avg"
          loading={loading}
        />
        <StatCard
          title={t("admin.dashboard.stats.growth")} // Sử dụng i18n
          value={`${dashboardStats.growthRate.toFixed(1)}%`}
          change={dashboardStats.growthRate}
          icon="growth"
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "overview"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <HiChartPie className="w-5 h-5" />
            {t("admin.dashboard.tabs.overview")} {/* Sử dụng i18n */}
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "month"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <HiTrendingUp className="w-5 h-5" />
            {t("admin.dashboard.tabs.month")} {/* Sử dụng i18n */}
          </button>
          <button
            onClick={() => setActiveTab("year")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "year"
                ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <HiCalendar className="w-5 h-5" />
            {t("admin.dashboard.tabs.year")} {/* Sử dụng i18n */}
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <TopSellingItems
              items={bestSellingItems}
              title={t("admin.dashboard.charts.bestSellingItems")} // Sử dụng i18n
              type="best"
              loading={loading}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <TopSellingItems
              items={worstSellingItems}
              title={t("admin.dashboard.charts.worstSellingItems")} // Sử dụng i18n
              type="worst"
              loading={loading}
            />
          </div>
        </div>
      )}

      {activeTab === "month" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <RevenueChart
            data={currentMonthRevenue}
            title={t("admin.dashboard.charts.monthRevenue")} // Sử dụng i18n
            type="bar"
            loading={loading}
          />
        </div>
      )}

      {activeTab === "year" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <RevenueChart
            data={currentYearRevenue}
            title={t("admin.dashboard.charts.yearRevenue")} // Sử dụng i18n
            type="line"
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
