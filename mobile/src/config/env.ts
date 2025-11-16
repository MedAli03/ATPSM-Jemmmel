// src/config/env.ts
import Constants from "expo-constants";
import { NativeModules, Platform } from "react-native";

const EXPLICIT_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const FALLBACK_HOST = process.env.EXPO_PUBLIC_LOCAL_IP;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT ?? "5000";
const API_PATH = normalizePath(process.env.EXPO_PUBLIC_API_PATH ?? "/api");
const API_PROTOCOL = process.env.EXPO_PUBLIC_API_PROTOCOL ?? "http";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function parseHost(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  try {
    const formatted = value.startsWith("http") ? value : `http://${value}`;
    return new URL(formatted).hostname;
  } catch {
    return undefined;
  }
}

function resolveRuntimeHost(): string | undefined {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname || "localhost";
  }

  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  const scriptHost = parseHost(scriptURL);
  if (scriptHost) {
    return scriptHost;
  }

  const expoHost =
    (Constants as any)?.expoConfig?.hostUri ||
    (Constants as any)?.manifest?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri;
  const manifestHost = parseHost(expoHost);
  if (manifestHost) {
    return manifestHost;
  }

  return undefined;
}

function resolveHost() {
  let host = parseHost(FALLBACK_HOST) ?? resolveRuntimeHost() ?? "localhost";

  if (
    Platform.OS === "android" &&
    (host === "localhost" || host === "127.0.0.1")
  ) {
    host = "10.0.2.2";
  }

  return host;
}

function buildBaseUrl() {
  if (EXPLICIT_BASE_URL) {
    return EXPLICIT_BASE_URL.replace(/\/$/, "");
  }

  const host = resolveHost();
  return `${API_PROTOCOL}://${host}:${API_PORT}${API_PATH}`;
}

export const API_BASE_URL = buildBaseUrl();
