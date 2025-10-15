import api from './client';

export async function fetchActiveSchoolYear() {
  const response = await api.get('/annees-scolaires/active');
  return response?.data?.data ?? response?.data ?? null;
}
