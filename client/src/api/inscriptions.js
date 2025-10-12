// src/api/inscriptions.js
import client from "./client";

function unwrap(res) {
  const payload = res?.data;
  if (payload?.data !== undefined) return payload.data;
  return payload;
}

export async function createInscription(payload) {
  const res = await client.post("/inscriptions", payload);
  return unwrap(res);
}
