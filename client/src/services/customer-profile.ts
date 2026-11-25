
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

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage?: string | null;
  role: string;
  createdAt: string;
}

export interface UpdateCustomerProfileData {
  name: string;
  phone: string;
}

export interface ChangeCustomerPasswordData {
  currentPassword: string;
  newPassword: string;
}

export const customerProfileAPI = {
  async getProfile(): Promise<CustomerProfile> {
    const response = await api.get("/customer/profile");
    return response.data.user;
  },

  async updateProfile(
    data: UpdateCustomerProfileData
  ): Promise<CustomerProfile> {
    const response = await api.patch("/customer/profile", data);
    return response.data.user;
  },

  async changePassword(
    data: ChangeCustomerPasswordData
  ): Promise<void> {
    await api.patch("/customer/profile/change-password", data);
  },
};
