/* eslint-disable no-empty */
// src/api/enfants.create.js
import client from "./client";

/* ---------- tiny helpers ---------- */
const hasMeaningfulKeys = (obj) =>
  !!obj &&
  Object.values(obj).some(
    (v) => v !== null && v !== "" && typeof v !== "undefined"
  );

/* ---------- core calls ---------- */

// 1) Create child
export async function createEnfant(enfant) {
  // enfant: { nom, prenom, date_naissance, parent_user_id? }
  const { data } = await client.post("/enfants", enfant);
  return data?.data ?? data; // support {ok,data} or raw object
}

// 2) Upsert fiche_enfant — try multiple backend route shapes safely
export async function upsertFicheEnfant(enfantId, fiche) {
  // We try (in order):
  //   PUT /enfants/:id/fiche         (current API)
  //   PUT /enfants/:id/fiche-enfant  (legacy naming)
  //   PUT /fiche-enfant              (flat), body must include enfant_id

  // 2.1 — new consolidated route
  try {
    const { data } = await client.put(`/enfants/${enfantId}/fiche`, fiche);
    return data?.data ?? data;
  } catch (e1) {
    if (e1?.response?.status !== 404) throw e1;
  }

  // 2.2 — previous REST shape kept for backwards compatibility
  try {
    const { data } = await client.put(`/enfants/${enfantId}/fiche-enfant`, fiche);
    return data?.data ?? data;
  } catch (e2) {
    if (e2?.response?.status !== 404) throw e2;
  }

  // 2.3 — very old flat endpoint shape (last resort)
  const { data } = await client.put(`/fiche-enfant`, {
    enfant_id: enfantId,
    ...fiche,
  });
  return data?.data ?? data;
}

// 3) Upsert parents_fiche — you already have this route
export async function upsertParentsFiche(enfantId, parentsFiche) {
  const { data } = await client.put(`/enfants/${enfantId}/parents-fiche`, {
    enfant_id: enfantId,
    ...parentsFiche,
  });
  return data?.data ?? data;
}

// Optional: create a parent account from parents_fiche (kept commented)
// export async function createParentAccount(enfantId, payload = {}) {
//   const { data } = await client.post(`/enfants/${enfantId}/create-parent-account`, payload);
//   return data?.data ?? data;
// }

// Cleanup on failure
export async function removeEnfant(enfantId) {
  await client.delete(`/enfants/${enfantId}`);
}

/**
 * Transactional flow called ONLY on “Confirm”.
 * 1) create Enfant
 * 2) upsert fiche_enfant  (if it has meaningful values)
 * 3) upsert parents_fiche (if it has meaningful values)
 * If any step after (1) fails, delete the created child (compensating action)
 */
export async function createEnfantFlow({ enfant, fiche, parentsFiche }) {
  let enfantCreated = null;

  try {
    // (1) create child
    enfantCreated = await createEnfant(enfant);
    const enfantId = enfantCreated?.id ?? enfantCreated?.data?.id;
    if (!enfantId) throw new Error("لم يرجع المعرّف enfant.id من الخادم");

    // (2) fiche_enfant only if it has content
    if (hasMeaningfulKeys(fiche)) {
      await upsertFicheEnfant(enfantId, fiche);
    }

    // (3) parents_fiche only if it has content
    if (hasMeaningfulKeys(parentsFiche)) {
      await upsertParentsFiche(enfantId, parentsFiche);
    }

    return enfantCreated; // caller (wizard) redirects on success
  } catch (err) {
    // Compensating delete (only if child was created)
    try {
      if (enfantCreated?.id) await removeEnfant(enfantCreated.id);
    } catch {}
    throw err;
  }
}
