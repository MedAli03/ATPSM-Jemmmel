// src/api/evenements.js
import client from "./client";

function unwrap(res) {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (payload?.data !== undefined) return payload.data;
  return payload;
}

export async function getUpcomingEvenements(params = {}) {
  const res = await client.get("/evenements/upcoming", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}
