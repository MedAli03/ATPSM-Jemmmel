// src/api/educateurs.js
import client from "./client";

function toBoolean(value) {
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return undefined;
}

function normalizeEducateur(raw = {}) {
  const isActive =
    raw.is_active ??
    raw.isActive ??
    (typeof raw.status === "string"
      ? raw.status === "ACTIVE" || raw.status === "active"
      : undefined);

  const coerced = toBoolean(isActive);

  const base = {
    ...raw,
    prenom: raw.prenom ?? raw.first_name ?? raw.firstName ?? "",
    nom: raw.nom ?? raw.last_name ?? raw.lastName ?? "",
    telephone: raw.telephone ?? raw.phone ?? raw.mobile ?? "",
    email: raw.email ?? raw.mail ?? "",
  };

  if (coerced !== undefined) {
    base.is_active = coerced;
    base.status = coerced ? "active" : "archived";
  }

  return base;
}

function normalizeMeta(payload, fallback) {
  const page = Number(payload?.page ?? payload?.current ?? fallback.page ?? 1);
  const limit = Number(payload?.pageSize ?? payload?.limit ?? fallback.limit ?? 10);
  const total = Number(
    payload?.total ?? payload?.count ?? payload?.meta?.total ?? fallback.total ?? 0
  );

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallback.page ?? 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : fallback.limit ?? 10,
    total: Number.isFinite(total) && total >= 0 ? total : fallback.total ?? 0,
  };
}

export async function listEducateurs({
  search,
  status,
  annee_id,
  page = 1,
  limit = 10,
} = {}) {
  const params = {
    role: "EDUCATEUR",
    page,
    pageSize: limit,
  };

  if (search) params.q = search;
  if (annee_id) params.annee_id = annee_id;
  if (status === "active") params.is_active = 1;
  if (status === "archived") params.is_active = 0;

  const res = await client.get("/utilisateurs", { params });
  const payload = res?.data ?? {};
  const data = payload.data ?? payload;
  const rows =
    data.items ??
    data.rows ??
    data.results ??
    (Array.isArray(data) ? data : []);

  let items = Array.isArray(rows) ? rows.map(normalizeEducateur) : [];

  if (status === "active") {
    items = items.filter((item) => toBoolean(item.is_active) !== false);
  } else if (status === "archived") {
    items = items.filter((item) => toBoolean(item.is_active) === false);
  }

  const metaSource = payload.meta ?? data.meta ?? payload;
  const meta = normalizeMeta(metaSource, { page, limit, total: items.length });
  meta.total = items.length;

  return { items, meta };
}

export async function getEducateur(id) {
  if (!id) return null;
  const res = await client.get(`/utilisateurs/${id}`);
  const payload = res?.data ?? {};
  const data = payload.data ?? payload;
  return normalizeEducateur(data);
}

export async function createEducateur(payload) {
  const body = {
    ...payload,
    role: "EDUCATEUR",
  };

  const res = await client.post("/utilisateurs", body);
  const payloadData = res?.data ?? {};
  const data = payloadData.data ?? payloadData;
  return normalizeEducateur(data);
}

export async function updateEducateur(id, payload) {
  const res = await client.put(`/utilisateurs/${id}`, {
    ...payload,
    role: "EDUCATEUR",
  });
  const payloadData = res?.data ?? {};
  const data = payloadData.data ?? payloadData;
  return normalizeEducateur(data);
}

export async function archiveEducateur(id) {
  const res = await client.put(`/utilisateurs/${id}`, { is_active: false, role: "EDUCATEUR" });
  const payload = res?.data ?? {};
  const data = payload.data ?? payload;
  return normalizeEducateur(data);
}

export async function unarchiveEducateur(id) {
  const res = await client.put(`/utilisateurs/${id}`, { is_active: true, role: "EDUCATEUR" });
  const payload = res?.data ?? {};
  const data = payload.data ?? payload;
  return normalizeEducateur(data);
}
