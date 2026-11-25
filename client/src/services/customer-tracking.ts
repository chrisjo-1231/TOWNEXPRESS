
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

export interface TrackingStatusHistory {
  id: string;
  status: string;
  remarks: string | null;
  createdAt: string;
}

export interface CustomerOrderTracking {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  deliveryAddress: string;

  store: {
    id: string;
    name: string;
    phone: string | null;
    address: string;
  };

  delivery: {
    id: string;
    riderId: string | null;
    pickupTime: string | null;
    deliveredAt: string | null;
    proofImage: string | null;
    notes: string | null;
  } | null;

  statusHistory: TrackingStatusHistory[];
}

// ============================================
// CUSTOMER TRACKING API
// ============================================

export const customerTrackingAPI = {
  async getTracking(orderId: string): Promise<CustomerOrderTracking> {
    const response = await api.get(
      `/customer/tracking/${orderId}`
    );

    return response.data.tracking;
  },
};
