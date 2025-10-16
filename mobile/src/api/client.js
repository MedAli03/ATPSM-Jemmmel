import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  console.warn('EXPO_PUBLIC_API_BASE_URL is not defined. Requests may fail.');
}

let authToken = null;
let hasLoadedStoredToken = false;

async function hydrateTokenFromStorage() {
  if (hasLoadedStoredToken) {
    return authToken;
  }

  hasLoadedStoredToken = true;

  try {
    const stored = await SecureStore.getItemAsync('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      authToken = parsed?.token ?? null;
    } else {
      authToken = null;
    }
  } catch (error) {
    console.warn('Failed to load auth token from SecureStore', error);
    authToken = null;
  }

  return authToken;
}

export function setAuthToken(token) {
  authToken = token;
  hasLoadedStoredToken = true;
}

export function clearAuthToken() {
  authToken = null;
  hasLoadedStoredToken = true;
}

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

client.interceptors.request.use(async (config) => {
  if (!authToken) {
    await hydrateTokenFromStorage();
  }

  if (authToken && config.headers) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => {
    const payload = response.data ?? {};
    return {
      ok: true,
      status: response.status,
      data: payload?.data ?? payload,
      message: payload?.message ?? null
    };
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || 'Request failed';
      const normalizedError = new Error(message);
      normalizedError.status = status;
      normalizedError.data = data;
      throw normalizedError;
    }

    throw error;
  }
);

export default client;
