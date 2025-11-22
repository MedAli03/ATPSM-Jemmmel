// src/api/annees.js
import client from "./client";

export async function listAnnees(params = {}) {
  const { data } = await client.get("/annees", { params });
  return data; // { ok, data: [{id, libelle, est_active, statut}, ...] }
}

export async function getActiveAnnee() {
  const { data } = await client.get("/annees/active");
  return data; // { ok, data: {id, libelle, est_active} }
}

function unwrap(res) {
  const payload = res?.data;
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload?.data) return payload.data;
  return payload;
}

export async function fetchSchoolYears() {
  const res = await client.get("/annees-scolaires");
  return unwrap(res) || [];
}

export async function fetchActiveSchoolYear() {
  const res = await client.get("/annees-scolaires/active");
  const data = unwrap(res);
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

// Mutations (Président)
export async function createAnnee(payload) {
  const { data } = await client.post("/annees", payload);
  return data;
}

export async function updateAnnee(id, payload) {
  const { data } = await client.put(`/annees/${id}`, payload);
  return data;
}

export async function activateAnnee(id) {
  const { data } = await client.post(`/annees/${id}/activate`);
  return data;
}

export async function archiveAnnee(id) {
  const { data } = await client.post(`/annees/${id}/archive`);
  return data;
}
