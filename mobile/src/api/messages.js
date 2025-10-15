import api from './client';

export async function fetchThreads(role) {
  const { data } = await api.get('/threads', { params: { role } });
  return data;
}

export async function fetchThreadMessages(threadId) {
  const { data } = await api.get(`/threads/${threadId}/messages`);
  return data;
}

export async function sendThreadMessage(threadId, payload) {
  const { data } = await api.post(`/threads/${threadId}/messages`, payload);
  return data;
}
