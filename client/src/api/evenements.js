// src/api/evenements.js
import client from "./client";

function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export async function getUpcomingEvents({ annee_id, limit = 5 } = {}) {
  const params = { limit };
  if (annee_id != null && annee_id !== "") params.annee_id = annee_id;

  const res = await client.get("/evenements/upcoming", { params });
  return toArray(res?.data);
}
