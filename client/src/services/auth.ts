
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authAPI = axios.create({
  baseURL: API_URL,
});

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  role: "ADMIN" | "STORE_OWNER" | "STORE_STAFF" | "RIDER" | "CUSTOMER";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await authAPI.post("/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await authAPI.post("/auth/register", data);

  return response.data;
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await authAPI.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.user as User;
}
