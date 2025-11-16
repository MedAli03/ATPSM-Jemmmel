// src/features/auth/api.ts
import { api } from "../../services/api";
import { LoginResponse } from "./types";

interface LoginPayload {
  email: string;
  mot_de_passe: string;
}

export async function loginRequest({
  email,
  mot_de_passe,
}: LoginPayload): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", {
    email,
    mot_de_passe,
  });
  return response.data;
}
