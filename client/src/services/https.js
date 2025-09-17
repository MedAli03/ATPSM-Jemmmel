// src/services/http.js (if you don’t already have it)
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
