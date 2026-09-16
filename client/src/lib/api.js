import axios from "axios";

const defaultBackend = "https://vertex-studio-api.onrender.com";
const rawBackend = (typeof import.meta !== "undefined" && (import.meta.env?.VITE_API_URL || import.meta.env?.VITE_BACKEND_URL)) || defaultBackend;
export const API = rawBackend 
  ? (rawBackend.endsWith("/api") ? rawBackend : `${rawBackend.replace(/\/$/, "")}/api`) 
  : `${defaultBackend}/api`;

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("vx_token") : null;
  if (token) {
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (
      typeof response.data === "string" &&
      (response.data.trim().toLowerCase().startsWith("<!doctype html") || response.data.trim().toLowerCase().startsWith("<html"))
    ) {
      return Promise.reject(new Error("API route returned HTML instead of JSON. Ensure VITE_API_URL is configured."));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default api;
