import axios from "axios";

export function normalizeApiBaseUrl(value?: string) {
  const fallbackUrl = "http://127.0.0.1:8000";
  const rawUrl = value?.trim() || fallbackUrl;

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl.replace(/\/+$/, "");
  }

  return `https://${rawUrl.replace(/^\/+|\/+$/g, "")}`;
}

export const apiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;
