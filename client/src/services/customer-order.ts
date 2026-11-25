
import axios from "axios";


const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const customerOrderAPIInstance = axios.create({
  baseURL: API_URL,
});

customerOrderAPIInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("townexpress_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================
// TYPES
// ============================================

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export type CustomerPaymentMethod = "CASH" | "COD" | "GCASH";

export interface DeliveryZone {
  id: string;
  name: string;
  barangay: string;
  deliveryFee: number;
}

export interface CheckoutData {
  storeId: string;
  zoneId: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod: CustomerPaymentMethod;
  items: CheckoutItem[];
}

export interface CheckoutOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
  payment: {
    id: string;
    method: CustomerPaymentMethod;
    status: string;
    amount: number;
  } | null;
  store: {
    id: string;
    name: string;
  };
}

export const customerOrderAPI = {
  async getDeliveryZones(): Promise<DeliveryZone[]> {
    const response = await customerOrderAPIInstance.get(
      "/customer/delivery-zones"
    );

    return response.data.zones;
  },

  async checkout(data: CheckoutData): Promise<CheckoutOrder> {
    const response = await customerOrderAPIInstance.post(
      "/customer/orders/checkout",
      data
    );

    return response.data.order;
  },
};
