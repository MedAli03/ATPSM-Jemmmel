// src/api/annees.js
import client from "./client";

function unwrap(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null) {
    if ("data" in payload) return payload.data;
    return payload;
  }
  return payload;
}

export async function listAnnees() {
  const { data } = await client.get("/annees");
  return data; // { ok, data: [{id, libelle, est_active}, ...] }
}

export async function getActiveAnnee() {
  const { data } = await client.get("/annees/active");
  return data; // { ok, data: {id, libelle, est_active} }
}

export async function listAnneesScolaires() {
  const res = await client.get("/annees-scolaires");
  const data = unwrap(res?.data);
  return Array.isArray(data) ? data : [];
}

export async function getActiveAnneeScolaire() {
  const res = await client.get("/annees-scolaires/active");
  const data = unwrap(res?.data);
  return data && typeof data === "object" ? data : null;
}
