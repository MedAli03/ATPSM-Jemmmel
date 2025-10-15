import api from './client';

export async function fetchDailyNotesByPei(peiId, { page = 1, pageSize = 20 } = {}) {
  try {
    const response = await api.get(`/pei/${peiId}/daily-notes`, {
      params: { page, pageSize }
    });
    const payload = response?.data ?? {};
    const items = Array.isArray(payload.data) ? payload.data : [];
    return {
      items,
      meta: {
        page: payload.page ?? page,
        pageSize: payload.pageSize ?? pageSize,
        total: payload.total ?? items.length
      }
    };
  } catch (error) {
    if (error?.response?.status === 403) {
      return { items: [], meta: { page, pageSize, total: 0 } };
    }
    throw error;
  }
}

export async function createDailyNote(peiId, payload) {
  const response = await api.post(`/pei/${peiId}/daily-notes`, payload);
  return response?.data ?? null;
}
