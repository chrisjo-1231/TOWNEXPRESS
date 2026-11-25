
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

export interface AvailableRider {
  id: string;
  vehicleType: string | null;
  plateNumber: string | null;
  availability: "AVAILABLE" | "BUSY" | "OFFLINE";
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface AssignRiderResponse {
  success: boolean;
  message: string;
  assignment: {
    orderId: string;
    orderNumber: string;
    riderId: string;
    riderName: string;
    availability: string;
  };
}

export type DeliveryRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface AdminDeliveryRequest {
  id: string;
  status: DeliveryRequestStatus;
  riderMessage: string | null;
  adminNote: string | null;
  orderId: string;
  riderId: string;
  reviewedById: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;

  order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number | string;
    deliveryFee: number | string;
    totalAmount: number | string;
    deliveryAddress: string;
    notes: string | null;
    createdAt: string;

    customer: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };

    store: {
      id: string;
      name: string;
      address: string;
      phone: string | null;
    };

    zone: {
      id: string;
      name: string;
      barangay: string;
      deliveryFee: number | string;
    };

    items: {
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        image: string | null;
      };
    }[];

    payment: {
      method: string;
      status: string;
      amount: number | string;
    } | null;

    delivery: {
      id: string;
      riderId: string | null;
    } | null;
  };

  rider: {
    id: string;
    vehicleType: string | null;
    plateNumber: string | null;
    availability: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      isActive: boolean;
    };
  };

  reviewedBy: {
    id: string;
    name: string;
  } | null;
}

export interface DeliveryRequestsResponse {
  success: boolean;
  requests: AdminDeliveryRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeliveryRequestActionResponse {
  success: boolean;
  message: string;
  approval?: {
    requestId: string;
    orderId: string;
    orderNumber: string;
    riderId: string;
    riderName: string;
    orderStatus: string;
    riderAvailability: string;
    rejectedRequests: number;
  };
  rejection?: {
    requestId: string;
    orderNumber: string;
    riderName: string;
    status: DeliveryRequestStatus;
  };
}

// ============================================
// API
// ============================================

export const adminDeliveryAPI = {
  // Get available riders
  async getAvailableRiders(): Promise<AvailableRider[]> {
    const response = await api.get(
      "/admin/deliveries/available-riders"
    );

    return response.data.riders;
  },

  // Assign rider directly
  async assignRider(
    orderId: string,
    riderId: string
  ): Promise<AssignRiderResponse> {
    const response = await api.patch(
      `/admin/deliveries/${orderId}/assign-rider`,
      { riderId }
    );

    return response.data;
  },

  // Get delivery requests
  async getDeliveryRequests(
    status: DeliveryRequestStatus | "ALL" = "PENDING",
    page = 1,
    limit = 20
  ): Promise<DeliveryRequestsResponse> {
    const response = await api.get(
      "/admin/deliveries/requests",
      {
        params: {
          status,
          page,
          limit,
        },
      }
    );

    return response.data;
  },

  // Approve delivery request
  async approveDeliveryRequest(
    requestId: string,
    adminNote?: string
  ): Promise<DeliveryRequestActionResponse> {
    const response = await api.patch(
      `/admin/deliveries/requests/${requestId}/approve`,
      { adminNote }
    );

    return response.data;
  },

  // Reject delivery request
  async rejectDeliveryRequest(
    requestId: string,
    adminNote?: string
  ): Promise<DeliveryRequestActionResponse> {
    const response = await api.patch(
      `/admin/deliveries/requests/${requestId}/reject`,
      { adminNote }
    );

    return response.data;
  },
};
