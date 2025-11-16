// src/features/auth/types.ts
export type UserRole = "PARENT" | "EDUCATEUR" | "PRESIDENT" | "DIRECTEUR" | "ADMIN";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: User;
}
