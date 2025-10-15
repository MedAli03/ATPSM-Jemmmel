import api from './client';

export async function fetchUnreadNotifications() {
  const { data } = await api.get('/notifications', { params: { status: 'unread' } });
  return data;
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`);
  return data;
}
