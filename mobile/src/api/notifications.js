import api from './client';

export async function fetchUnreadNotifications({ page = 1, limit = 20 } = {}) {
  const response = await api.get('/notifications/me', {
    params: { page, limit, only_unread: 1 }
  });
  const payload = response?.data ?? {};
  const items = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.items)
    ? payload.items
    : [];
  const metaSource = payload.meta ?? {};
  const unread = metaSource.unread ?? payload.unread ?? null;
  const meta = {
    page: metaSource.page ?? payload.page ?? page,
    limit: metaSource.limit ?? payload.limit ?? limit,
    total: metaSource.total ?? payload.total ?? items.length,
    unread
  };
  return { items, meta };
}

export async function markNotificationRead(id) {
  const response = await api.patch(`/notifications/${id}/read`);
  const payload = response?.data ?? {};
  return {
    data: payload.data ?? null,
    meta: payload.meta ?? null
  };
}
