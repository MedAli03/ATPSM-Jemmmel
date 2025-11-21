// src/services/http.js (if you don’t already have it)
import axios from "axios";

const resolveBaseURL = () => {
  const explicit = import.meta.env.VITE_API_BASE_URL;
  if (explicit) {
    return explicit;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const normalize = (value) => value.replace(/\/$/, "");

    // When running through a front-end dev server (Vite/CRA), default to the
    // backend dev port. Otherwise stick to the same origin and rely on the API
    // being reverse-proxied under /api in production builds.
    const devPorts = new Set(["5173", "5174", "4173", "4174", "3000"]);
    if (devPorts.has(port)) {
      return `${protocol}//${hostname}:5000/api`;
    }

    return `${normalize(window.location.origin)}/api`;
  }

  return "http://localhost:5000/api";
};

const http = axios.create({
  baseURL: resolveBaseURL(),
});

http.interceptors.request.use((config) => {
  // Prefer the token saved in the persisted auth object (used by AuthContext).
  // Fallback to the legacy "token" key for backward compatibility.
  let token = null;
  try {
    const rawAuth = localStorage.getItem("auth");
    if (rawAuth) token = JSON.parse(rawAuth)?.token;
  } catch (err) {
    // ignore JSON parse errors and fall back
  }

  if (!token) {
    token = localStorage.getItem("token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
