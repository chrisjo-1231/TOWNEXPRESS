
import { authAPI } from "./auth";

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const settingsAPI = {
  updateProfile: async (data: UpdateProfileInput) => {
    const response = await authAPI.patch("/auth/profile", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordInput) => {
    const response = await authAPI.patch("/auth/change-password", data);
    return response.data;
  },
};
