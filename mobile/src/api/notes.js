import api from './client';

export async function fetchEducatorDailyNotes(limit = 20) {
  const { data } = await api.get('/daily-notes', { params: { mine: 1, limit } });
  return data;
}

export async function createDailyNote(payload) {
  const { data } = await api.post('/daily-notes', payload);
  return data;
}
