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

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    growthRate: 0,
  });

  // Revenue data
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<
    RevenueStatisticsDto[]
  >([]);
  const [currentYearRevenue, setCurrentYearRevenue] = useState<
    RevenueStatisticsDto[]
  >([]);

  // Active tab
  const [activeTab, setActiveTab] = useState<"overview" | "month" | "year">(
    "overview"
  );

  // Menu items data
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

      // Fetch all data in parallel
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

      // Calculate dashboard stats from current month data
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

        // Calculate growth rate (compare with previous month if available)
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
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert color="failure" onDismiss={() => setError(null)}>
          <span className="font-medium">Lỗi!</span> {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-6">
      {/* Header with gradient */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Analytics
            </h1>
            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
              <Badge color="success" className="animate-pulse">
                Live
              </Badge>
              Tổng quan thống kê và báo cáo kinh doanh
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            {loading ? (
              <>
                <Spinner size="sm" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <HiChartPie className="w-5 h-5" />
                <span className="font-semibold">Làm mới</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards with gradient backgrounds */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu tháng này"
          value={dashboardStats.totalRevenue}
          icon="revenue"
          loading={loading}
        />
        <StatCard
          title="Tổng đơn hàng"
          value={dashboardStats.totalOrders}
          icon="orders"
          loading={loading}
        />
        <StatCard
          title="Giá trị đơn trung bình"
          value={dashboardStats.avgOrderValue}
          icon="avg"
          loading={loading}
        />
        <StatCard
          title="Tăng trưởng"
          value={`${dashboardStats.growthRate.toFixed(1)}%`}
          change={dashboardStats.growthRate}
          icon="growth"
          loading={loading}
        />
      </div>

      {/* Navigation Tabs */}
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
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "month"
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <HiTrendingUp className="w-5 h-5" />
            Theo tháng
          </button>
          <button
            onClick={() => setActiveTab("year")}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "year"
                ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <HiCalendar className="w-5 h-5" />
            Theo năm
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Selling Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <TopSellingItems
              items={bestSellingItems}
              title="Món ăn bán chạy nhất"
              type="best"
              loading={loading}
            />
          </div>

          {/* Worst Selling Items */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <TopSellingItems
              items={worstSellingItems}
              title="Món ăn cần cải thiện"
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
            title="📊 Doanh thu theo ngày (Tháng hiện tại)"
            type="bar"
            loading={loading}
          />
        </div>
      )}

      {activeTab === "year" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <RevenueChart
            data={currentYearRevenue}
            title="📈 Doanh thu theo tháng (Năm hiện tại)"
            type="line"
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
