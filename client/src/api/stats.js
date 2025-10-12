// src/api/stats.js
import client from "./client";

function unwrap(res) {
  const payload = res?.data;
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && typeof payload.data === "object") return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    if ("data" in payload) return payload.data;
    return payload;
  }
  return payload;
}

export async function getDirectorStats({ annee_id, date_debut, date_fin } = {}) {
  const params = {};
  if (annee_id != null && annee_id !== "") params.annee_id = annee_id;
  if (date_debut) params.date_debut = date_debut;
  if (date_fin) params.date_fin = date_fin;

  const res = await client.get("/stats/directeur", { params });
  const data = unwrap(res);
  return data && typeof data === "object" ? data : {};
}

export async function getChildrenPerGroup({ annee_id, limit = 10 } = {}) {
  const params = { limit };
  if (annee_id != null && annee_id !== "") params.annee_id = annee_id;

  const res = await client.get("/stats/enfants-par-groupe", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

export async function getMonthlyRegistrations({ annee_id } = {}) {
  const params = {};
  if (annee_id != null && annee_id !== "") params.annee_id = annee_id;

  const res = await client.get("/stats/inscriptions-mensuelles", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

export async function getFamilySituationDistribution({ annee_id } = {}) {
  const params = {};
  if (annee_id != null && annee_id !== "") params.annee_id = annee_id;

  const res = await client.get("/stats/situation-familiale", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}
