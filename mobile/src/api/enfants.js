import api from './client';

export async function fetchMyChildren() {
  const { data } = await api.get('/parents/me/children');
  return data;
}

export async function fetchChildDetails(id) {
  const { data } = await api.get(`/enfants/${id}`);
  return data;
}

export async function fetchChildNotes(id, limit = 10) {
  const { data } = await api.get('/daily-notes', { params: { enfant_id: id, limit } });
  return data;
}

export async function fetchChildActivePei(id) {
  const { data } = await api.get('/pei/active', { params: { enfant_id: id } });
  return data;
}

export async function fetchGroupChildren(groupId) {
  const { data } = await api.get('/enfants', { params: { groupe_id: groupId } });
  return data;
}
