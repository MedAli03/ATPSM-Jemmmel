// src/api/stats.js
import client from "./client";

function unwrap(res) {
  const payload = res?.data;
  if (payload?.data !== undefined) return payload.data;
  return payload;
}

export async function getDirectorStats(params = {}) {
  const res = await client.get("/stats/directeur", { params });
  return unwrap(res) || {};
}

export async function getChildrenPerGroupStats(params = {}) {
  const res = await client.get("/stats/enfants-par-groupe", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

export async function getMonthlyInscriptions(params = {}) {
  const res = await client.get("/stats/inscriptions-mensuelles", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

export async function getFamilySituationDistribution(params = {}) {
  const res = await client.get("/stats/situation-familiale", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}
