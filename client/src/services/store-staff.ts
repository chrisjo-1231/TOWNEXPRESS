
import { authAPI } from "./auth";

export type StaffStatus = "INVITED" | "ACTIVE" | "DISABLED";

export interface StoreStaff {
  id: string;
  title: string | null;
  status: StaffStatus;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    isActive: boolean;
  };
}

export interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  title?: string;
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string | null;
  title?: string | null;
}

export const storeStaffAPI = {
  getAll: async () => {
    const response = await authAPI.get("/store-staff");
    return response.data;
  },

  create: async (data: CreateStaffInput) => {
    const response = await authAPI.post("/store-staff", data);
    return response.data;
  },

  update: async (id: string, data: UpdateStaffInput) => {
    const response = await authAPI.patch(`/store-staff/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: StaffStatus) => {
    const response = await authAPI.patch(
      `/store-staff/${id}/status`,
      { status }
    );
    return response.data;
  },

  remove: async (id: string) => {
    const response = await authAPI.delete(`/store-staff/${id}`);
    return response.data;
  },
};
