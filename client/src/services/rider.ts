
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

export type RiderAvailability = "AVAILABLE" | "BUSY" | "OFFLINE";

export interface RiderProfile {
  id: string;
  vehicleType: string | null;
  plateNumber: string | null;
  availability: RiderAvailability;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    profileImage?: string | null;
    isActive?: boolean;
    createdAt?: string;
  };
}
export interface UpdateRiderProfileData {
  name: string;
  phone?: string | null;
  vehicleType?: string | null;
  plateNumber?: string | null;
}

export interface ChangeRiderPasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RiderDashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
}

export type RiderDeliveryStatus =
  | "ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface RiderDelivery {
  id: string;
  pickupTime: string | null;
  deliveredAt: string | null;
  proofImage: string | null;
  notes: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number | string;
    deliveryAddress: string;
    customer: {
      id: string;
      name: string;
      phone: string | null;
    };
    store: {
      id: string;
      name: string;
      address: string;
      phone: string | null;
    };
    zone: {
      name: string;
      barangay: string;
    };
    items: {
      id: string;
      quantity: number;
      product: {
        name: string;
        image: string | null;
      };
    }[];
  };
}

export interface RiderDashboardResponse {
  rider: RiderProfile;
  statistics: RiderDashboardStats;
  recentDeliveries: RiderDelivery[];
}

export interface RiderAssignedDeliveriesResponse {
  deliveries: RiderDelivery[];
  total: number;
}

// ============================================
// AVAILABLE DELIVERY TYPES
// ============================================

export interface RiderAvailableDelivery {
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

  deliveryRequests: {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    requestedAt: string;
    riderMessage: string | null;
  }[];
}

export interface RiderAvailableDeliveriesResponse {
  deliveries: RiderAvailableDelivery[];
  total: number;
}

export interface RiderDeliveryRequestResponse {
  success: boolean;
  message: string;
  request: {
    id: string;
    orderId: string;
    riderId: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
    riderMessage: string | null;
    requestedAt: string;
  };
}

// ============================================
// RIDER EARNINGS TYPES
// ============================================

export interface RiderEarnings {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  totalCompletedDeliveries: number;
  currency: string;
  earningRate: string;
}

export interface RiderEarningsResponse {
  success: boolean;
  message: string;
  earnings: RiderEarnings;
}

// ============================================
// RIDER DELIVERY HISTORY TYPES
// ============================================

export interface RiderDeliveryHistoryItem {
  id: string;
  deliveredAt: string;
  earnings: number;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    deliveryFee: number | string;
    totalAmount: number | string;
    deliveryAddress: string;
    customer: {
      id: string;
      name: string;
      phone: string | null;
    };
    store: {
      id: string;
      name: string;
      address: string;
      phone: string | null;
    };
    zone: {
      name: string;
      barangay: string;
    };
    items: {
      id: string;
      quantity: number;
      product: {
        name: string;
        image: string | null;
      };
    }[];
    payment: {
      method: string;
      status: string;
      amount: number | string;
    } | null;
  };
}

export interface RiderDeliveryHistoryResponse {
  success: boolean;
  message: string;
  deliveries: RiderDeliveryHistoryItem[];
  summary: {
    totalDeliveries: number;
    currentPageEarnings: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// RIDER API
// ============================================

export const riderAPI = {
  // ============================================
  // PROFILE
  // ============================================

  async getProfile(): Promise<RiderProfile> {
    const response = await api.get("/rider/profile");
    return response.data.rider;
  },

  async updateProfile(
    data: UpdateRiderProfileData
  ) {
    const response = await api.patch("/rider/profile", data);
    return response.data;
  },

  async updateAvailability(
    availability: "AVAILABLE" | "OFFLINE"
  ) {
    const response = await api.patch("/rider/availability", {
      availability,
    });

    return response.data;
  },

  async changePassword(
    data: ChangeRiderPasswordData
  ) {
    const response = await api.patch(
      "/rider/change-password",
      data
    );

    return response.data;
  },

  // ============================================
  // DASHBOARD
  // ============================================

  async getDashboard(): Promise<RiderDashboardResponse> {
    const response = await api.get("/rider/dashboard");
    return response.data.dashboard;
  },

  // ============================================
  // ASSIGNED DELIVERIES
  // ============================================

  async getAssignedDeliveries(): Promise<RiderAssignedDeliveriesResponse> {
    const response = await api.get("/rider/assigned-deliveries");

    return {
      deliveries: response.data.deliveries,
      total: response.data.total,
    };
  },

  // ============================================
  // AVAILABLE DELIVERIES
  // ============================================

  async getAvailableDeliveries(): Promise<RiderAvailableDeliveriesResponse> {
    const response = await api.get("/rider/available-deliveries");

    return {
      deliveries: response.data.deliveries,
      total: response.data.total,
    };
  },

  // ============================================
  // REQUEST DELIVERY
  // ============================================

  async requestDelivery(
    orderId: string,
    riderMessage?: string
  ): Promise<RiderDeliveryRequestResponse> {
    const response = await api.post(
      `/rider/delivery-requests/${orderId}`,
      { riderMessage }
    );

    return response.data;
  },

  // ============================================
  // UPDATE DELIVERY STATUS
  // ============================================

  async updateDeliveryStatus(
    deliveryId: string,
    status: "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED"
  ) {
    const response = await api.patch(
      `/rider/deliveries/${deliveryId}/status`,
      { status }
    );

    return response.data;
  },

  // ============================================
  // EARNINGS
  // ============================================

  async getEarnings(): Promise<RiderEarningsResponse> {
    const response = await api.get("/rider/earnings");
    return response.data;
  },

  // ============================================
  // DELIVERY HISTORY
  // ============================================

  async getDeliveryHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<RiderDeliveryHistoryResponse> {
    const response = await api.get("/rider/delivery-history", {
      params,
    });

    return response.data;
  },
};
