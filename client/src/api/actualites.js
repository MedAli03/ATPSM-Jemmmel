// src/api/actualites.js
import client from "./client";

function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export async function getLatestActualites({ limit = 5 } = {}) {
  const res = await client.get("/actualites", { params: { limit } });
  return toArray(res?.data);
}
