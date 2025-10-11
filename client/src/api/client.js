// src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Read token from localStorage.auth = { token, user }
function getToken() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const { token } = JSON.parse(raw);
    return token || null;
  } catch {
    return null;
  }
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default client;
