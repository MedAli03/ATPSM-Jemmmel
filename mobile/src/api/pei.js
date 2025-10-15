import api from './client';

function mapPei(record) {
  if (!record) return null;
  return {
    id: record.id,
    enfant_id: record.enfant_id ?? record.enfant?.id ?? null,
    educateur_id: record.educateur_id ?? record.educateur?.id ?? null,
    statut: record.statut ?? null,
    objectifs: record.objectifs ?? null,
    annee_id: record.annee_id ?? null,
    enfant: record.enfant ?? null,
    raw: record
  };
}

export async function fetchActivePeisForEducator(educateurId, { statut = 'actif', pageSize = 50 } = {}) {
  try {
    const response = await api.get('/pei', {
      params: { educateur_id: educateurId, statut, pageSize }
    });
    const payload = response?.data ?? {};
    const rows = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.rows)
      ? payload.rows
      : Array.isArray(payload.items)
      ? payload.items
      : [];

    const items = rows.map(mapPei).filter(Boolean);
    const total = payload.total ?? payload.count ?? payload.meta?.total ?? items.length;
    const page = payload.page ?? payload.meta?.page ?? 1;
    const size = payload.pageSize ?? payload.meta?.pageSize ?? payload.limit ?? pageSize;

    return {
      items,
      meta: {
        total,
        page,
        pageSize: size
      }
    };
  } catch (error) {
    if (error?.response?.status === 403) {
      return { items: [], meta: { total: 0, page: 1, pageSize } };
    }
    throw error;
  }
}

export async function fetchActivePeiByChild(enfantId) {
  try {
    const response = await api.get('/pei', {
      params: { enfant_id: enfantId, statut: 'actif', pageSize: 1 }
    });
    const payload = response?.data ?? {};
    const rows = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.rows)
      ? payload.rows
      : Array.isArray(payload.items)
      ? payload.items
      : [];
    return mapPei(rows[0] ?? null);
  } catch (error) {
    if (error?.response?.status === 403) {
      return null;
    }
    throw error;
  }
}
