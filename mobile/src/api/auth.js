import client from './client';

export async function login({ identifier, password }) {
  const response = await client.post('/auth/login', {
    identifier,
    password
  });

  if (!response?.ok) {
    throw new Error('Authentication failed');
  }

  return response.data;
}
