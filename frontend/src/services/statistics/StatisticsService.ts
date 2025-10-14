import api from "../../api/axios";
import type {
  RevenueStatisticsDto,
  MenuItemSalesDto,
  PeriodType,
} from "../types/statistics.types";

const STATISTICS_BASE_URL = "/statistics";

export const StatisticsService = {
  // ==================== Revenue Statistics ====================

  /**
   * Get revenue statistics by period
   */
  getRevenueByPeriod: async (
    period: PeriodType,
    startDate: string,
    endDate: string
  ): Promise<RevenueStatisticsDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/revenue/${period}`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  },

  /**
   * Get current month revenue by day
   */
  getCurrentMonthRevenue: async (): Promise<RevenueStatisticsDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/revenue/current-month`
    );
    return response.data;
  },

  /**
   * Get current year revenue by month
   */
  getCurrentYearRevenue: async (): Promise<RevenueStatisticsDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/revenue/current-year`
    );
    return response.data;
  },

  // ==================== Menu Item Sales Statistics ====================

  /**
   * Get best-selling menu items
   */
  getBestSellingMenuItems: async (
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<MenuItemSalesDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/menu-items/best-selling`,
      {
        params: { startDate, endDate, limit },
      }
    );
    return response.data;
  },

  /**
   * Get worst-selling menu items (flop)
   */
  getWorstSellingMenuItems: async (
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<MenuItemSalesDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/menu-items/worst-selling`,
      {
        params: { startDate, endDate, limit },
      }
    );
    return response.data;
  },

  /**
   * Get current month best-selling menu items
   */
  getCurrentMonthBestSelling: async (
    limit: number = 10
  ): Promise<MenuItemSalesDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/menu-items/current-month/best-selling`,
      {
        params: { limit },
      }
    );
    return response.data;
  },

  /**
   * Get current month worst-selling menu items
   */
  getCurrentMonthWorstSelling: async (
    limit: number = 10
  ): Promise<MenuItemSalesDto[]> => {
    const response = await api.get(
      `${STATISTICS_BASE_URL}/menu-items/current-month/worst-selling`,
      {
        params: { limit },
      }
    );
    return response.data;
  },
};

export default StatisticsService;
