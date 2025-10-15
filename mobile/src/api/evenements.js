import api from './client';

export async function fetchUpcomingEvents(limit = 1) {
  const { data } = await api.get('/evenements/upcoming', { params: { limit } });
  return data;
}
