import api from './client';

export async function fetchMe() {
  const { data } = await api.get('/me');
  return data;
}

export async function updateMe(payload) {
  const { data } = await api.put('/me', payload);
  return data;
}
