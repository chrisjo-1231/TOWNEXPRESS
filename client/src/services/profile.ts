
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const profileAPI = axios.create({
  baseURL: `${API_URL}/profile`,
});

profileAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("townexpress_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const profileService = {
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await profileAPI.post("/avatar", formData);

    return response.data;
  },

  async removeAvatar() {
    const response = await profileAPI.delete("/avatar");

    return response.data;
  },
};

export function getProfileImageUrl(image: string | null | undefined) {
  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const serverURL = API_URL.replace(/\/api\/?$/, "");

  return `${serverURL}${image.startsWith("/") ? "" : "/"}${image}`;
}
