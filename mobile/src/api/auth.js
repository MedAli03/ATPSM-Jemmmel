import * as SecureStore from 'expo-secure-store';

import api, { setAuthToken } from './client';

const STORAGE_KEY = 'ATPSM_AUTH';

async function storeCredentials(data) {
  if (!data?.token) {
    throw new Error('Missing auth token');
  }
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(data));
  setAuthToken(data.token);
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  await storeCredentials(data);
  return data;
}

export async function loadStoredCredentials() {
  const value = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.token) {
      setAuthToken(parsed.token);
      return parsed;
    }
  } catch (error) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  }
  return null;
}

export async function clearCredentials() {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
}

export async function updateStoredUser(user) {
  const existing = await SecureStore.getItemAsync(STORAGE_KEY);
  if (!existing) return null;
  try {
    const parsed = JSON.parse(existing);
    const updated = { ...parsed, user };
    await storeCredentials(updated);
    return updated;
  } catch (error) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return null;
  }
}

export { storeCredentials };
