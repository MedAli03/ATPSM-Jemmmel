// src/api/enfants.js
import client from "./client";

/**
 * Normalizes to: { rows, count, page, pageSize }
 * Your backend likely returns { rows, count, page, limit }.
 */
function normalizeListResponse(d, { page, limit }) {
  const rows = d?.rows ?? [];
  const count = d?.count ?? 0;
  const serverPage = d?.page ?? page;
  const serverLimit = d?.limit ?? limit;

  return {
    rows,
    count,
    page: Number(serverPage),
    pageSize: Number(serverLimit),
  };
}

/**
 * ============ LIST & GET ============
 */

/**
 * List enfants with optional filters/pagination.
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=10]
 * @param {string} [params.q]               // search query
 * @param {number|string} [params.parent_user_id] // filter by linked parent id
 * @returns {Promise<{rows: any[], count: number, page: number, pageSize: number}>}
 */
/**
 * List enfants — matches Joi schema:
 * GET /enfants?q&page&limit
 */
export async function listEnfants({ page = 1, pageSize = 10, q } = {}) {
  const limit = Number(pageSize) || 10;
  const { data } = await client.get("/enfants", {
    params: {
      page,
      limit,
      ...(q ? { q } : {}),
    },
  });
  return normalizeListResponse(data, { page, limit });
}


/**
 * Get enfant by id.
 * @param {number|string} enfantId
 */
export async function getEnfantById(enfantId) {
  const { data } = await client.get(`/enfants/${enfantId}`);
  return data?.data; // { id, nom, prenom, date_naissance, ... }
}

/**
 * ============ CREATE / UPDATE / DELETE ============
 */

/**
 * Create enfant.
 * @param {{ nom:string, prenom:string, date_naissance:string, [key:string]:any }} payload
 * @returns {Promise<{ id:number, ... }>}
 */
export async function createEnfant(payload) {
  const { data } = await client.post("/enfants", payload);
  return data;
}

/**
 * Update enfant (basic props). Use only if your backend supports PUT /enfants/:id
 * If not needed now, keep for future parity.
 * @param {number|string} enfantId
 * @param {Object} payload
 */
export async function updateEnfant(enfantId, payload) {
  const { data } = await client.put(`/enfants/${enfantId}`, payload);
  return data?.data;
}

/**
 * Delete enfant.
 * @param {number|string} enfantId
 */
export async function deleteEnfant(enfantId) {
  const { data } = await client.delete(`/enfants/${enfantId}`);
  return data?.data;
}

/**
 * ============ FICHE ENFANT ============
 */

/**
 * Get fiche_enfant for enfant.
 * @param {number|string} enfantId
 */
export async function getFiche(enfantId) {
  const { data } = await client.get(`/enfants/${enfantId}/fiche`);
  return data?.data || null;
}

/**
 * Upsert fiche_enfant for enfant.
 * @param {number|string} enfantId
 * @param {Object} payload  // e.g., { groupe_sanguin, allergies, notes_medicales, ... }
 */
export async function upsertFiche(enfantId, payload) {
  const { data } = await client.put(`/enfants/${enfantId}/fiche`, payload);
  return data?.data;
}

/**
 * ============ PARENTS FICHE ============
 */

/**
 * Get parents_fiche for enfant.
 * @param {number|string} enfantId
 */
export async function getParentsFiche(enfantId) {
  const { data } = await client.get(`/enfants/${enfantId}/parents-fiche`);
  return data?.data || null;
}

/**
 * Upsert parents_fiche for enfant.
 * @param {number|string} enfantId
 * @param {Object} payload
 *   // e.g., { pere_nom, pere_tel, pere_email, mere_nom, mere_tel, mere_email, adresse }
 */
export async function upsertParentsFiche(enfantId, payload) {
  const { data } = await client.put(
    `/enfants/${enfantId}/parents-fiche`,
    payload
  );
  return data?.data;
}

export async function listNonInscrits({ annee_id, limit = 8, search } = {}) {
  const params = { limit };
  if (annee_id) params.annee_id = annee_id;
  if (search) params.search = search;
  const { data } = await client.get("/enfants/non-inscrits", { params });
  const payload = data?.data ?? data;
  return Array.isArray(payload) ? payload : [];
}

/**
 * ============ LINK / UNLINK PARENT ============
 */

/**
 * Link a parent account to enfant.
 * @param {number|string} enfantId
 * @param {number|string} parent_user_id
 */
export async function linkParent(enfantId, parent_user_id) {
  const { data } = await client.patch(`/enfants/${enfantId}/link-parent`, {
    parent_user_id,
  });
  return data?.data;
}

/**
 * Unlink parent account from enfant.
 * @param {number|string} enfantId
 */
export async function unlinkParent(enfantId) {
  const { data } = await client.patch(`/enfants/${enfantId}/unlink-parent`);
  return data?.data;
}

/**
 * ============ UTILITIES FOR WIZARD FLOW ============
 * Optional helpers you might call from your hook:
 */

/**
 * Create full flow (create enfant -> upsert fiche -> upsert parents_fiche).
 * If fiche/parents upsert fails, delete enfant (compensation).
 * Prefer to wrap this with React Query in a custom hook (e.g., useCreateEnfantFlow).
 * @param {{ enfant:Object, fiche:Object, parentsFiche:Object }} param0
 */
export async function createEnfantFlow({ enfant, fiche, parentsFiche }) {
  let created = null;
  try {
    created = await createEnfant(enfant);
    const id = created?.id;
    if (!id) throw new Error("Create enfant failed: missing id");

    await upsertFiche(id, fiche);
    await upsertParentsFiche(id, parentsFiche);
    return { id };
  } catch (err) {
    if (created?.id) {
      try {
        await deleteEnfant(created.id);
      } catch {
        // swallow compensation error to keep original failure
      }
    }
    throw err;
  }
}

export async function getFicheByEnfantId(id) {
  const { data } = await client.get(`/enfants/${id}/fiche`);
  return data.data;
}
export async function getParentsFicheByEnfantId(id) {
  const { data } = await client.get(`/enfants/${id}/parents-fiche`);
  return data.data;
}