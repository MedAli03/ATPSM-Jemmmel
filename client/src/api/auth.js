// src/api/auth.js
import client from "./client";

export async function login(email, mot_de_passe) {
  const { data } = await client.post("/auth/login", { email, mot_de_passe });
  // data: { token, user: { id, role, nom, prenom, email } }
  return data;
}

export function logout() {
  localStorage.removeItem("auth");
}
