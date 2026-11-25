
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";


export interface CustomerStore {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address: string;
  barangay?: string | null;
  phone?: string | null;
  logo?: string | null;
  category:
    | "GROCERY"
    | "RESTAURANT"
    | "PHARMACY"
    | "WATER_STATION"
    | "CONVENIENCE_STORE"
    | "BAKERY"
    | "OTHER";
  _count?: {
    products: number;
  };
}

export interface CustomerProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  isAvailable: boolean;
  createdAt: string;
}

interface StoresResponse {
  success: boolean;
  message: string;
  total: number;
  stores: CustomerStore[];
}

interface StoreResponse {
  success: boolean;
  message: string;
  store: CustomerStore;
}

interface ProductsResponse {
  success: boolean;
  message: string;
  total: number;
  store: {
    id: string;
    name: string;
  };
  products: CustomerProduct[];
}

export const customerStoreAPI = {
  getStores: async (filters?: {
    search?: string;
    category?: string;
    barangay?: string;
  }) => {
    const response = await customerStoreAPIInstance.get<StoresResponse>(
      "/",
      { params: filters }
    );

    return response.data;
  },

  getStoreById: async (id: string) => {
    const response = await customerStoreAPIInstance.get<StoreResponse>(
      `/${id}`
    );

    return response.data;
  },

  getStoreProducts: async (
    id: string,
    search?: string
  ) => {
    const response = await customerStoreAPIInstance.get<ProductsResponse>(
      `/${id}/products`,
      {
        params: search ? { search } : {},
      }
    );

    return response.data;
  },
};

const customerStoreAPIInstance = axios.create({
  baseURL: `${API_URL}/customer/stores`,
});
