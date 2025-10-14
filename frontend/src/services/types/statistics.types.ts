export interface RevenueStatisticsDto {
  period: string; // Date string (yyyy-MM-dd, yyyy-MM, or yyyy)
  totalRevenue: number;
  totalOrders: number;
}

export interface MenuItemSalesDto {
  menuItemId: number;
  menuItemName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  avatarUrl?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate: number;
}

export type PeriodType = 'day' | 'month' | 'year';
