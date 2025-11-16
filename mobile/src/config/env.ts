// src/config/env.ts
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

/**
 * Small helper that tries to infer the LAN IP Expo is tunnelling through.
 * It keeps the "hard-coded" 5000 default in dev (the backend listens on
 * http://localhost:5000/api/auth/login) but lets you override it with
 * EXPO_PUBLIC_API_URL or EXPO_PUBLIC_API_PORT (see app.config / .env).
 */
const API_PATH = "/api";
const FALLBACK_PORT =
  process.env.EXPO_PUBLIC_API_PORT ??
  process.env.EXPO_PUBLIC_SERVER_PORT ??
  "5000";

const envUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_BASE_URL ||
  process.env.API_URL;

function buildUrl(hostname: string | undefined | null): string | null {
  if (!hostname) {
    return null;
  }
  const sanitizedHost = hostname.replace(/^https?:\/\//i, "").split("/")[0];
  if (!sanitizedHost || sanitizedHost === "localhost") {
    return null;
  }
  return `http://${sanitizedHost}:${FALLBACK_PORT}${API_PATH}`;
}

function resolveFromScriptURL(): string | null {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  if (!scriptURL) {
    return null;
  }
  try {
    const { hostname } = new URL(scriptURL);
    return buildUrl(hostname);
  } catch (error) {
    return null;
  }
}

function resolveFromExpoConstants(): string | null {
  const debuggerHost =
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.expoConfig?.hostUri;
  if (!debuggerHost) {
    return null;
  }
  const host = debuggerHost.split(":")[0];
  return buildUrl(host);
}

function resolveDefault(): string {
  if (Platform.OS === "android") {
    // Android emulator needs the host loopback 10.0.2.2 to reach your PC
    return `http://10.0.2.2:${FALLBACK_PORT}${API_PATH}`;
  }
  return `http://localhost:${FALLBACK_PORT}${API_PATH}`;
}

const API_BASE_URL =
  envUrl || resolveFromScriptURL() || resolveFromExpoConstants() || resolveDefault();

export { API_BASE_URL };
