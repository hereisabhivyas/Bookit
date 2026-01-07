import axios from "axios";

export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:10000").replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const withApiBase = (path: string) => `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
