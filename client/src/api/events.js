// src/api/events.js
import client from "./client";

const BASE_PATH = "/evenements";

function normalizeListResponse(res, fallback = {}) {
  const payload = res?.data ?? {};
  const rows = Array.isArray(payload.rows)
    ? payload.rows
    : Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
    ? payload.items
    : [];

  return {
    rows,
    count: Number(
      payload.count ?? payload.total ?? payload.meta?.total ?? rows.length ?? 0
    ),
    page: Number(payload.page ?? payload.meta?.page ?? fallback.page ?? 1),
    limit: Number(payload.limit ?? payload.meta?.limit ?? fallback.limit ?? 10),
  };
}

export async function listEvents({
  page = 1,
  limit = 10,
  q = "",
  audience = "",
  date_debut,
  date_fin,
} = {}) {
  const params = { page, limit };
  if (q) params.q = q;
  if (audience) params.audience = audience;
  if (date_debut) params.date_debut = date_debut;
  if (date_fin) params.date_fin = date_fin;

  const res = await client.get(BASE_PATH, { params });
  return normalizeListResponse(res, { page, limit });
}

export async function createEvent(payload) {
  const res = await client.post(BASE_PATH, payload);
  return res?.data?.data ?? res?.data ?? null;
}

export async function updateEvent(id, payload) {
  const res = await client.put(`${BASE_PATH}/${id}`, payload);
  return res?.data?.data ?? res?.data ?? null;
}

export async function deleteEvent(id) {
  const res = await client.delete(`${BASE_PATH}/${id}`);
  return res?.data?.data ?? res?.data ?? null;
}

