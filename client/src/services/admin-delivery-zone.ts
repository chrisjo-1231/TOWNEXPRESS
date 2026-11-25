
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

export interface AdminDeliveryZone {
  id: string;
  name: string;
  barangay: string;
  deliveryFee: number;
  isActive: boolean;
}

export interface DeliveryZoneInput {
  name: string;
  barangay: string;
  deliveryFee: number;
  isActive: boolean;
}

export const adminDeliveryZoneAPI = {
  async getAll(): Promise<AdminDeliveryZone[]> {
    const response = await api.get("/admin/delivery-zones");
    return response.data.zones;
  },

  async create(data: DeliveryZoneInput): Promise<AdminDeliveryZone> {
    const response = await api.post("/admin/delivery-zones", data);
    return response.data.zone;
  },

  async update(
    id: string,
    data: Partial<DeliveryZoneInput>
  ): Promise<AdminDeliveryZone> {
    const response = await api.patch(
      `/admin/delivery-zones/${id}`,
      data
    );

    return response.data.zone;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/delivery-zones/${id}`);
  },
};
