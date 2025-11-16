// src/services/api.ts
import axios from "axios";
import { API_BASE_URL } from "../config/env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token plus tard
api.interceptors.request.use(async (config) => {
  // TODO: récupérer le token JWT du storage sécurisé
  return config;
});
