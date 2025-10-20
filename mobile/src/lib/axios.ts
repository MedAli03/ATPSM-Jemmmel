import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { env } from './env';
import { useAuthStore } from '@features/auth/store';

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000
});

type RetryConfig = AxiosRequestConfig & { _retryCount?: number };

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  config.headers = {
    Accept: 'application/json',
    'Content-Type': config.headers?.['Content-Type'] ?? 'application/json',
    ...config.headers
  };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    if (response?.status === 401) {
      await useAuthStore.getState().logout();
    }

    if (response && [429, 500, 502, 503].includes(response.status)) {
      const retryConfig = config as RetryConfig;
      retryConfig._retryCount = (retryConfig._retryCount ?? 0) + 1;
      if (retryConfig._retryCount <= 2) {
        const delay = 500 * 2 ** (retryConfig._retryCount - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(retryConfig);
      }
    }

    return Promise.reject(error);
  }
);

export { api };
