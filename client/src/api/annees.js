// src/api/annees.js
import client from "./client";

export async function listAnnees() {
  const { data } = await client.get("/annees");
  return data; // { ok, data: [{id, libelle, est_active}, ...] }
}

export async function getActiveAnnee() {
  const { data } = await client.get("/annees/active");
  return data; // { ok, data: {id, libelle, est_active} }
}
