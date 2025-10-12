// src/api/inscriptions.js
import client from "./client";

export async function createInscription(payload) {
  const res = await client.post("/inscriptions", payload);
  const data = res?.data?.data ?? res?.data ?? null;
  return data;
}
