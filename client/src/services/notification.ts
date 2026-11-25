
import { authAPI } from "./auth";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

export const notificationAPI = {
  getAll: async (): Promise<NotificationResponse> => {
    const response = await authAPI.get("/notifications");
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await authAPI.patch(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await authAPI.patch(
      "/notifications/read-all"
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authAPI.delete(
      `/notifications/${id}`
    );
    return response.data;
  },
};
