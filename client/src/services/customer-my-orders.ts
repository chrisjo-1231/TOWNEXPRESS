
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("townexpress_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ============================================
// TYPES
// ============================================

export interface CustomerOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  notes?: string | null;
  createdAt: string;

  store: {
    id: string;
    name: string;
    logo: string | null;
    phone: string | null;
    address: string;
  };

  zone: {
    id: string;
    name: string;
    barangay: string;
    deliveryFee: number;
  };

  items: CustomerOrderItem[];

  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
  } | null;

  delivery?: {
    id: string;
    riderId: string | null;
    pickupTime: string | null;
    deliveredAt: string | null;
    proofImage: string | null;
    notes: string | null;
  } | null;

  statusHistory: {
    id: string;
    status: string;
    remarks: string | null;
    createdAt: string;
  }[];
}

// ============================================
// CUSTOMER MY ORDERS API
// ============================================

export const customerMyOrdersAPI = {
  async getAll(): Promise<CustomerOrder[]> {
    const response = await api.get("/customer/my-orders");
    return response.data.orders;
  },

  async getById(id: string): Promise<CustomerOrder> {
    const response = await api.get(`/customer/my-orders/${id}`);
    return response.data.order;
  },
};
