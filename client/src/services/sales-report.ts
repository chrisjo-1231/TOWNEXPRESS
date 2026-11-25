
import { authAPI } from "./auth";

export interface SalesSummary {
  totalRevenue: number;
  totalSubtotal: number;
  totalDeliveryFees: number;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
}

export interface DailySale {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  image: string | null;
  quantitySold: number;
  revenue: number;
}

export interface SalesReport {
  success: boolean;
  message: string;
  store: {
    id: string;
    name: string;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: SalesSummary;
  dailySales: DailySale[];
  topProducts: TopProduct[];
}

export const salesReportAPI = {
  getReport: async (
    startDate?: string,
    endDate?: string
  ): Promise<SalesReport> => {
    const response = await authAPI.get("/sales-reports", {
      params: {
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });

    return response.data;
  },
};
