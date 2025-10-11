// src/api/educateurs.js
import client from "./client";

function normalizeEducateur(raw = {}) {
  if (!raw || typeof raw !== "object") return raw;
  const groupes = Array.isArray(raw.groupes_actuels)
    ? raw.groupes_actuels
    : [];

  const isActive = raw.is_active !== false;

  return {
    id: raw.id,
    nom: raw.nom || "",
    prenom: raw.prenom || "",
    email: raw.email || "",
    telephone: raw.telephone || "",
    adresse: raw.adresse || "",
    is_active: isActive,
    status: isActive ? "active" : "archived",
    updated_at: raw.updated_at || raw.updatedAt || null,
    created_at: raw.created_at || raw.createdAt || null,
    groupes_actuels: groupes.map((g) => ({
      id: g.id,
      nom: g.nom,
      annee_id: g.annee_id || null,
      annee: g.annee || null,
    })),
  };
}

function normalizeMeta(meta = {}, fallback = {}) {
  return {
    page: Number(meta.page ?? fallback.page ?? 1),
    limit: Number(meta.limit ?? fallback.limit ?? 10),
    total: Number(meta.total ?? fallback.total ?? 0),
  };
}

function sanitizePayload(payload = {}) {
  const body = { ...payload };
  if (typeof body.nom === "string") body.nom = body.nom.trim();
  if (typeof body.prenom === "string") body.prenom = body.prenom.trim();
  if (typeof body.email === "string") body.email = body.email.trim();
  if (typeof body.telephone === "string") body.telephone = body.telephone.trim();
  if (typeof body.adresse === "string") body.adresse = body.adresse.trim();
  if (typeof body.mot_de_passe === "string" && body.mot_de_passe.trim() === "") {
    delete body.mot_de_passe;
  }
  return body;
}

export async function listEducateurs({
  search,
  status = "all",
  annee_id,
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (annee_id) params.annee_id = annee_id;

  const res = await client.get("/educateurs", { params });
  const payload = res?.data || {};
  const items = Array.isArray(payload.data)
    ? payload.data.map(normalizeEducateur)
    : [];
  const meta = normalizeMeta(payload.meta, { page, limit, total: items.length });
  return { items, meta };
}

export async function getEducateur(id) {
  if (!id) return null;
  const res = await client.get(`/educateurs/${id}`);
  const payload = res?.data || {};
  return normalizeEducateur(payload.data || payload);
}

export async function createEducateur(payload) {
  const body = sanitizePayload(payload);
  const res = await client.post("/educateurs", body);
  const data = res?.data || {};
  return normalizeEducateur(data.data || data);
}

export async function updateEducateur(id, payload) {
  const body = sanitizePayload(payload);
  const res = await client.put(`/educateurs/${id}`, body);
  const data = res?.data || {};
  return normalizeEducateur(data.data || data);
}

export async function archiveEducateur(id) {
  const res = await client.post(`/educateurs/${id}/archive`);
  const data = res?.data || {};
  return normalizeEducateur(data.data || data);
}

export async function unarchiveEducateur(id) {
  const res = await client.post(`/educateurs/${id}/unarchive`);
  const data = res?.data || {};
  return normalizeEducateur(data.data || data);
}
