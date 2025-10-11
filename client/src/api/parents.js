// src/api/parents.js
import client from "./client";

function coerceBoolean(value) {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return undefined;
}

function normalizeListResponse(raw, fallback = {}) {
  const payload = raw?.data ?? raw ?? {};
  const rows = payload.rows ?? payload.items ?? [];
  const count = Number(payload.count ?? payload.total ?? rows.length ?? 0);
  const page = Number(payload.page ?? fallback.page ?? 1);
  const limit = Number(payload.limit ?? payload.pageSize ?? fallback.limit ?? 10);

  return { rows, count, page, pageSize: limit };
}

export async function listParents({
  page = 1,
  pageSize = 10,
  q = "",
  is_active = "",
} = {}) {
  const limit = Number(pageSize) || 10;
  const params = {
    page,
    limit,
    ...(q ? { q } : {}),
  };

  const active = coerceBoolean(is_active);
  if (active !== undefined) {
    params.is_active = active;
  }

  const { data } = await client.get("/parents", { params });
  return normalizeListResponse(data, { page, limit });
}

export default listParents;
