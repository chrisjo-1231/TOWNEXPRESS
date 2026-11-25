
import { authAPI } from "./auth";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  isAvailable: boolean;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  product: Product;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  products: Product[];
  total: number;
}

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  isAvailable?: boolean;
}

export const productAPI = {
  getAll: async (search = ""): Promise<ProductsResponse> => {
    const response = await authAPI.get("/products", {
      params: search ? { search } : {},
    });
    return response.data;
  },

  getById: async (id: string): Promise<ProductResponse> => {
    const response = await authAPI.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: ProductInput): Promise<ProductResponse> => {
    const response = await authAPI.post("/products", data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<ProductInput>
  ): Promise<ProductResponse> => {
    const response = await authAPI.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await authAPI.delete(`/products/${id}`);
    return response.data;
  },
};
