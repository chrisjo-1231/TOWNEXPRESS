
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

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface CustomerNotificationResponse {
  notifications: CustomerNotification[];
  unreadCount: number;
  totalCount: number;
}

export const customerNotificationAPI = {
  async getAll(): Promise<CustomerNotificationResponse> {
    const response = await api.get("/customer/notifications");

    return {
      notifications: response.data.notifications,
      unreadCount: response.data.unreadCount,
      totalCount: response.data.totalCount,
    };
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/customer/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/customer/notifications/read-all");
  },
};
