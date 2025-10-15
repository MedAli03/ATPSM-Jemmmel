import api from './client';

export async function fetchMyGroups() {
  const { data } = await api.get('/groupes', { params: { mine: 1, annee_id: 'active' } });
  return data;
}
