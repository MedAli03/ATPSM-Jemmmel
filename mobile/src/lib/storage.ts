import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth.token';
const REFRESH_KEY = 'auth.refresh';
const ROLE_KEY = 'auth.role';

export async function saveToken(token: string, refreshToken?: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  if (refreshToken) {
    await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
  }
}

export async function saveRole(role: string): Promise<void> {
  await SecureStore.setItemAsync(ROLE_KEY, role);
}

export async function loadSession(): Promise<{
  token: string | null;
  refreshToken: string | null;
  role: string | null;
}> {
  const [token, refreshToken, role] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
    SecureStore.getItemAsync(ROLE_KEY)
  ]);
  return { token, refreshToken, role };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(ROLE_KEY)
  ]);
}
