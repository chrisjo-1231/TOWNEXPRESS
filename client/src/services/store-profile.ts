
import { authAPI } from "./auth";

export interface StoreProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  barangay: string;
  phone: string | null;
  logo: string | null;
  category:
    | "GROCERY"
    | "RESTAURANT"
    | "PHARMACY"
    | "WATER_STATION"
    | "CONVENIENCE_STORE"
    | "BAKERY"
    | "OTHER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason: string | null;
  isActive: boolean;
  updatedAt: string;
}

interface StoreProfileResponse {
  success: boolean;
  message: string;
  store: StoreProfile;
}

export interface UpdateStoreProfileInput {
  name?: string;
  description?: string | null;
  address?: string;
  barangay?: string;
  phone?: string | null;
  category?: StoreProfile["category"];
}

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const storeProfileAPI = {
  getMyStore: async (): Promise<StoreProfileResponse> => {
    const response = await authAPI.get("/store-owners/my-store");
    return response.data;
  },

  update: async (
    data: UpdateStoreProfileInput
  ): Promise<StoreProfileResponse> => {
    const response = await authAPI.patch(
      "/store-owners/my-store",
      data
    );

    return response.data;
  },

  uploadLogo: async (file: File): Promise<StoreProfileResponse> => {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await authAPI.post(
      "/store-owners/my-store/logo",
      formData
    );

    return response.data;
  },

  getLogoUrl: (logo: string | null) => {
    if (!logo) return null;

    return `${API_URL.replace(/\/api\/?$/, "")}${logo}`;
  },
};
