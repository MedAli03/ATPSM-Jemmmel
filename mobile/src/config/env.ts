// src/config/env.ts
import { Platform } from "react-native";

const DEFAULT_LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP ?? "192.168.1.100";
const DEFAULT_PORT = process.env.EXPO_PUBLIC_API_PORT ?? "5000";
const DEFAULT_PATH = process.env.EXPO_PUBLIC_API_PATH ?? "/api";

function resolveHost() {
  if (Platform.OS === "android" && DEFAULT_LOCAL_IP === "localhost") {
    return "10.0.2.2";
  }
  return DEFAULT_LOCAL_IP;
}

export const API_BASE_URL = `http://${resolveHost()}:${DEFAULT_PORT}${DEFAULT_PATH}`;
