"use client";

import axios from "axios";
import { getToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  withCredentials: false, // keep cookies off, we’re using JWT in headers
});

// Attach token if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

// Example helper for your AI endpoint
export async function askAI(question: string) {
  const res = await api.post("/ai/query", { question });
  return res.data;
}
