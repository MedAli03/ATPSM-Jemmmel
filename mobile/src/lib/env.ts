import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  apiUrl: (extra.apiUrl as string | undefined) ?? process.env.EXPO_PUBLIC_API_URL ?? '',
  socketUrl:
    (extra.socketUrl as string | undefined) ?? process.env.EXPO_PUBLIC_SOCKET_URL ?? ''
};

if (!env.apiUrl) {
  console.warn('API URL is not configured. Set EXPO_PUBLIC_API_URL.');
}
