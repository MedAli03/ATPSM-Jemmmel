import client from "./client";

// Liste des PEI avec filtrage (statut, pagination)
export function listPeis(params = {}) {
  return client.get("/pei", { params }).then((res) => {
    const payload = res.data ?? {};
    const rows = payload.data ?? payload.rows ?? [];
    const count = Number(payload.total ?? payload.count ?? rows.length ?? 0);
    const page = Number(payload.page ?? params.page ?? 1);
    const pageSize = Number(payload.pageSize ?? params.pageSize ?? 10);
    return { rows, count, page, pageSize };
  });
}

// Détails complets d'un PEI (enfant, éducateur, activités, etc.)
export function getPei(id) {
  return client.get(`/pei/${id}`).then((res) => res.data);
}

// Mise à jour générique (objectifs / statut) — utilisé pour passer en attente de validation côté éducateur
export function updatePei(id, payload) {
  return client.put(`/pei/${id}`, payload).then((res) => res.data);
}

// Validation Président/Directeur -> statut VALIDE + métadonnées enregistrées au backend
export function validatePei(id) {
  return client.patch(`/pei/${id}/validate`).then((res) => res.data);
}

// Passage en CLOTURE/archivé
export function closePei(id) {
  return client.post(`/pei/${id}/close`).then((res) => res.data);
}

// Historique consolidé (observations, activités, notes, évaluations) pour un PEI
export function getPeiHistory(id) {
  return client.get(`/pei/${id}/history`).then((res) => {
    const payload = res.data ?? {};
    return payload.data ?? payload;
  });
}
