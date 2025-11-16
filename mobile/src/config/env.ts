// src/config/env.ts
import { NativeModules, Platform } from "react-native";

/**
 * Small helper that tries to infer the LAN IP Expo is tunnelling through.
 * It keeps the "hard-coded" 4000 default in dev but lets you override it
 * with EXPO_PUBLIC_API_URL (see app.config / .env).
 */
const API_PATH = "/api";
const FALLBACK_PORT = process.env.EXPO_PUBLIC_API_PORT ?? "4000";

const envUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  process.env.API_URL;

function resolveFromScriptURL(): string | null {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) {
    return null;
  }
  try {
    const { hostname } = new URL(scriptURL);
    if (!hostname) {
      return null;
    }
    return `http://${hostname}:${FALLBACK_PORT}${API_PATH}`;
  } catch (error) {
    return null;
  }
}

function resolveDefault(): string {
  if (Platform.OS === "android") {
    // Android emulator needs the host loopback 10.0.2.2 to reach your PC
    return `http://10.0.2.2:${FALLBACK_PORT}${API_PATH}`;
  }
  return `http://localhost:${FALLBACK_PORT}${API_PATH}`;
}

const API_BASE_URL = envUrl || resolveFromScriptURL() || resolveDefault();

export { API_BASE_URL };
