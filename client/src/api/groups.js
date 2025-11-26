// src/api/groupes.js
import client from "./client";

/* ----------------------------- helpers ----------------------------- */
function unwrap(res) {
  // Accept { ok, data }, array, or object
  const d = res?.data;
  if (!d) return null;
  if (Array.isArray(d)) return d;
  if (typeof d === "object" && d !== null) {
    if ("data" in d) return d.data;
    return d;
  }
  return d;
}

function toArray(x) {
  return Array.isArray(x) ? x : x ? [x] : [];
}

/* --------------------------- années scolaires --------------------------- */
export async function listAnnees() {
  const res = await client.get("/annees");
  const data = unwrap(res);

  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.items)) return data.items;
  }

  if (Array.isArray(res?.data?.data)) return res.data.data;

  return [];
}

export async function getActiveAnnee() {
  // Expect { id, libelle, est_active, ... } or { ok:true, data:{...} }
  const res = await client.get("/annees/active");
  return unwrap(res) || null;
}

/* -------------------------------- groupes -------------------------------- */
export async function listGroupes({ anneeId, statut, search, page, limit } = {}) {
  // Prefer the new flat list route:
  // GET /groupes?anneeId=&statut=&search=&page=&limit=
  const params = {};
  if (anneeId != null) params.anneeId = anneeId;
  if (statut) params.statut = statut;
  if (search) params.search = search;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  try {
    const res = await client.get("/groupes", { params });
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    // Graceful fallback to legacy route if it exists
    if (e?.response?.status === 404 && anneeId != null) {
      const res2 = await client.get(`/groupes/annees/${anneeId}`, {
        params: { page, limit, statut, search },
      });
      const data2 = unwrap(res2);
      return Array.isArray(data2) ? data2 : [];
    }
    throw e;
  }
}

export async function getGroupe(id) {
  const res = await client.get(`/groupes/${id}`);
  return unwrap(res);
}

export async function createGroupe(payload) {
  // payload: { annee_id, nom, description?, statut? }
  const res = await client.post("/groupes", payload);
  return unwrap(res);
}

export async function updateGroupe(id, payload) {
  // payload: { nom?, description?, statut? }
  const res = await client.put(`/groupes/${id}`, payload);
  return unwrap(res);
}

export async function archiveGroupe(id, to /* "archive" | "actif" */) {
  const res = await client.patch(`/groupes/${id}/archive`, { statut: to });
  return unwrap(res);
}

export async function deleteGroupe(id, { anneeId } = {}) {
  // backend allows optional ?anneeId= for guard
  const res = await client.delete(`/groupes/${id}`, {
    params: anneeId != null ? { anneeId } : undefined,
  });
  return unwrap(res);
}

/* ------------------------------ inscriptions ------------------------------ */
// List inscriptions of a group for a given year
export async function listInscriptions({ groupeId, anneeId, page = 1, limit = 50 }) {
  const res = await client.get(`/groupes/${groupeId}/inscriptions`, {
    params: { anneeId, page, limit },
  });
  const data = unwrap(res);
  if (!data || typeof data !== "object") {
    return {
      items: Array.isArray(data) ? data : [],
      meta: { page, limit, total: Array.isArray(data) ? data.length : 0, hasMore: false },
    };
  }
  return {
    items: Array.isArray(data.items)
      ? data.items
      : Array.isArray(data)
      ? data
      : [],
    meta: {
      page: data.meta?.page ?? page,
      limit: data.meta?.limit ?? limit,
      total: data.meta?.total ?? (Array.isArray(data.items) ? data.items.length : 0),
      hasMore: data.meta?.hasMore ?? false,
    },
  };
}

// Batch add children to a group for a year
export async function addInscriptionsBatch({ groupeId, anneeId, enfantIds }) {
  const res = await client.post(
    `/groupes/${groupeId}/inscriptions`,
    { enfantIds: toArray(enfantIds) },
    { params: { anneeId } }
  );
  return unwrap(res);
}

// Remove a single inscription
export async function deleteInscription({ groupeId, inscriptionId }) {
  const res = await client.delete(`/groupes/${groupeId}/inscriptions/${inscriptionId}`);
  return unwrap(res);
}

/* ------------------------------- affectation ------------------------------- */
// Get current educator assignment for a given year
export async function getAffectation({ groupeId, anneeId }) {
  const res = await client.get(`/groupes/${groupeId}/affectation`, {
    params: { anneeId },
  });
  const data = unwrap(res);
  return data && typeof data === "object" ? data : null;
}

// Assign / replace educator
export async function setAffectation({ groupeId, anneeId, educateur_id }) {
  const res = await client.post(
    `/groupes/annees/${anneeId}/${groupeId}/educateur`,
    { educateur_id }
  );
  return unwrap(res);
}

// Remove assignment
export async function deleteAffectation({ groupeId, affectationId }) {
  const res = await client.delete(`/groupes/${groupeId}/affectation/${affectationId}`);
  return unwrap(res);
}

/* ---------------------------------- search --------------------------------- */
// Enfants search (used by add-to-group dialog)
// Accepts new or legacy list shapes; normalize to { items: [] }
export async function searchEnfants({ search, page = 1, limit = 10 } = {}) {
  const params = {};
  // Support both ?search= and ?q= depending on backend
  if (search) {
    params.search = search;
    params.q = search;
  }
  params.page = page;
  params.limit = limit;

  const res = await client.get("/enfants", { params });
  const raw = unwrap(res);
  // raw may be an array or an object with items
  if (Array.isArray(raw)) {
    return { items: raw };
  }
  if (raw && Array.isArray(raw.items)) {
    return { items: raw.items };
  }
  if (raw && Array.isArray(raw.data)) {
    return { items: raw.data };
  }
  return { items: [] };
}

// Educateurs search (role-filtered)
export async function searchEducateurs({ search } = {}) {
  const params = { role: "EDUCATEUR", is_active: 1 };
  if (search) params.search = search;
  const res = await client.get("/utilisateurs", { params });
  const data = unwrap(res);
  return Array.isArray(data) ? data : [];
}

/* ---------------------------- group candidates ---------------------------- */
export async function searchGroupChildrenCandidates({
  anneeId,
  search,
  scope = "available",
  page = 1,
  limit = 10,
  excludeGroupeId,
}) {
  const params = { scope, page, limit };
  if (search) params.search = search;
  if (excludeGroupeId) params.excludeGroupeId = excludeGroupeId;
  const res = await client.get(`/groupes/annees/${anneeId}/candidats/enfants`, {
    params,
  });
  const data = unwrap(res);
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    meta:
      data?.meta ?? {
        page,
        limit,
        total: Array.isArray(data?.items) ? data.items.length : 0,
        hasMore: false,
      },
  };
}

export async function searchGroupEducateurCandidates({ anneeId, search, page = 1, limit = 10 }) {
  const params = { page, limit };
  if (search) params.search = search;
  const res = await client.get(`/groupes/annees/${anneeId}/candidats/educateurs`, {
    params,
  });
  const data = unwrap(res);
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    meta:
      data?.meta ?? {
        page,
        limit,
        total: Array.isArray(data?.items) ? data.items.length : 0,
        hasMore: false,
      },
  };
}
