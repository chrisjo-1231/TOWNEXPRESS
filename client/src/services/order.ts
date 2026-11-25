
import { authAPI } from "./auth";

// ============================================
// TYPES
// ============================================

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

export interface OrderCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderProduct {
  id: string;
  name: string;
  image: string | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: OrderProduct;
}

export interface OrderPayment {
  id: string;
  method: "CASH" | "COD" | "GCASH";
  status: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  amount: number;
  reference: string | null;
}

export interface OrderRider {
  user: {
    id: string;
    name: string;
    phone: string | null;
  };
}

export interface OrderDelivery {
  id: string;
  riderId: string | null;
  pickupTime: string | null;
  deliveredAt: string | null;
  proofImage: string | null;
  notes: string | null;
  rider: OrderRider | null;
}

export interface OrderZone {
  id: string;
  name: string;
  barangay: string;
  deliveryFee: number;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  remarks: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  notes: string | null;
  customerId: string;
  storeId: string;
  zoneId: string;
  customer: OrderCustomer;
  items: OrderItem[];
  payment: OrderPayment | null;
  delivery: OrderDelivery | null;
  zone: OrderZone;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

// ============================================
// ORDER API
// ============================================

export const orderAPI = {
  // Get all orders
  getAll: async (params?: {
    search?: string;
    status?: OrderStatus | "";
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> => {
    const response = await authAPI.get("/orders", { params });
    return response.data;
  },

  // Get order details
  getById: async (id: string): Promise<OrderResponse> => {
    const response = await authAPI.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateStatus: async (
    id: string,
    data: {
      status: OrderStatus;
      remarks?: string;
    }
  ): Promise<OrderResponse> => {
    const response = await authAPI.patch(
      `/orders/${id}/status`,
      data
    );

    return response.data;
  },
};
