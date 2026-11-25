
import { authAPI } from "./auth";

export type StoreStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  barangay: string | null;
  phone: string | null;
  logo: string | null;
  category: string;
  status: StoreStatus;
  rejectionReason: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    products: number;
    orders: number;
  };
}

export interface StoreStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyForPickupOrders: number;
  assignedOrders: number;
  pickedUpOrders: number;
  outForDeliveryOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSales: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone: string | null;
  };
  _count: {
    items: number;
  };
}

export interface StoreDashboardResponse {
  success: boolean;
  message: string;
  store: Store;
  stats: StoreStats;
  recentOrders: RecentOrder[];
}

export const storeOwnerAPI = {
  getMyStore: async (): Promise<StoreDashboardResponse> => {
    const response = await authAPI.get("/store-owners/my-store");
    return response.data;
  },
};
