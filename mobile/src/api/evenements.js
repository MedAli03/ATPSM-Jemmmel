import api from './client';

export async function fetchUpcomingEvents({ limit = 1, audience } = {}) {
  const params = { limit };
  if (audience) params.audience = audience;
  const response = await api.get('/site/events', { params });
  const payload = response?.data?.data ?? response?.data ?? {};
  if (Array.isArray(payload)) return payload;
  return payload.items ?? [];
}
