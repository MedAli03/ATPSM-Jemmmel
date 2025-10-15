import api from './client';

export async function fetchGroups({ anneeId, page = 1, limit = 20, search } = {}) {
  const params = { page, limit };
  if (anneeId) params.anneeId = anneeId;
  if (search) params.search = search;
  const response = await api.get('/groupes', { params });
  const payload = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(payload) ? payload : payload?.items ?? [];
}

export async function fetchGroupChildren(groupeId, { anneeId, page = 1, limit = 50 } = {}) {
  const response = await api.get(`/groupes/${groupeId}/inscriptions`, {
    params: { anneeId, page, limit }
  });
  const payload = response?.data?.data ?? response?.data ?? {};
  const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
  return {
    items,
    meta: payload.meta ?? {
      page: payload.page ?? page,
      limit: payload.limit ?? limit,
      total: payload.total ?? items.length
    }
  };
}
