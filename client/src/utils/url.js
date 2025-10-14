const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

const ASSET_BASE_URL = (
  import.meta.env.VITE_ASSET_BASE_URL?.replace(/\/$/, "") ||
  API_BASE_URL.replace(/\/api$/, "")
).replace(/\/$/, "");

const UPLOAD_PREFIXES = ["uploads/", "storage/", "media/", "files/"];

function shouldPrefix(path = "") {
  const normalized = path.replace(/^\/+/, "");
  return UPLOAD_PREFIXES.some((prefix) => normalized.toLowerCase().startsWith(prefix));
}

export function resolveApiAssetPath(path) {
  if (!path || typeof path !== "string") {
    return null;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (!shouldPrefix(normalized)) {
    return normalized;
  }

  return `${ASSET_BASE_URL}${normalized}`;
}
