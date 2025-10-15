import api from './client';

function mapChild(record) {
  if (!record) return null;
  const nom = record.nom ?? record.last_name ?? record.name ?? '';
  const prenom = record.prenom ?? record.first_name ?? '';
  const fullName = [prenom, nom].filter(Boolean).join(' ').trim();
  return {
    id: record.id,
    nom,
    prenom,
    fullName: fullName || nom || prenom || String(record.id ?? ''),
    birthdate: record.date_naissance ?? record.birthdate ?? null,
    parentUserId: record.parent_user_id ?? null,
    raw: record
  };
}

export async function fetchMyChildren({ page = 1, limit = 20 } = {}) {
  const response = await api.get('/enfants/me/enfants', {
    params: { page, limit }
  });
  const payload = response?.data ?? {};
  const rows = Array.isArray(payload.rows)
    ? payload.rows
    : Array.isArray(payload.data?.rows)
    ? payload.data.rows
    : [];
  const items = rows.map(mapChild).filter(Boolean);
  return {
    items,
    meta: {
      page: payload.page ?? payload.data?.page ?? page,
      limit: payload.limit ?? payload.data?.limit ?? limit,
      total: payload.count ?? payload.data?.count ?? items.length
    }
  };
}

export async function fetchChildDetails(id) {
  const response = await api.get(`/enfants/${id}`);
  const payload = response?.data?.data ?? response?.data ?? null;
  return mapChild(payload);
}
