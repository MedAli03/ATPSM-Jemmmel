import api from './client';

export async function fetchMe() {
  const response = await api.get('/me');
  return response?.data ?? null;
}

export async function updateMe(payload) {
  const body = { ...payload };
  Object.keys(body).forEach((key) => {
    if (body[key] === undefined) delete body[key];
  });
  const response = await api.put('/me', body);
  return response?.data ?? null;
}
