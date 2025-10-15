import api from './client';

export async function fetchEducatorTodayStats() {
  const { data } = await api.get('/stats/educateur/today');
  return data;
}
