import client from "./client";

function baseNormalize(resp) {
  const d = resp?.data;
  const payload = d?.data ?? d ?? {};
  const items =
    payload.items ??
    payload.rows ??
    payload.results ??
    (Array.isArray(payload) ? payload : []);
  const total =
    payload.total ??
    payload.count ??
    (Array.isArray(payload) ? payload.length : 0);
  return { items: items || [], total: Number(total || 0) };
}

// detect provided even if false/"0"
function hasIsActive(v) {
  return (
    v === true || v === false ||
    v === 1 || v === 0 ||
    v === "1" || v === "0" ||
    v === "true" || v === "false"
  );
}

// normalize any value to boolean (for items)
function toBool(v) {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return undefined;
}

// to numeric for query (servers usually like 1/0)
function toNumeric(v) {
  const b = toBool(v);
  if (b === undefined) return undefined;
  return b ? 1 : 0;
}

function normalizeUser(u) {
  const active = toBool(u?.is_active); // ✅ handles 0/1/"0"/"1"/true/false
  return {
    ...u,
    is_active: active ?? u?.is_active, // keep original if unknown, but prefer boolean
    status:
      active === true ? "ACTIVE" :
      active === false ? "SUSPENDED" :
      undefined,
    created_at: u?.created_at || u?.createdAt || null,
    phone: u?.telephone ?? u?.phone ?? null,
  };
}

function applyClientActiveFilter(items, is_active) {
  if (!hasIsActive(is_active)) return items;
  const wantBool = toBool(is_active); // true or false
  if (wantBool === undefined) return items;

  // ✅ compare using coerced boolean per row
  return items.filter((u) => {
    const rowBool = toBool(u.is_active);
    // if server sent weird value, keep it (don’t over-filter)
    return rowBool === undefined ? true : rowBool === wantBool;
  });
}

/**
 * Sends is_active as 1/0 and also filters client-side (robust).
 */
export async function listUsers(params = {}) {
  const {
    page = 1,
    pageSize = 10,
    q = "",
    role = "",
    is_active = "",
    prefer = "page",
  } = params;

  const numericActive = hasIsActive(is_active) ? toNumeric(is_active) : undefined;

  const filters = {
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
    ...(numericActive !== undefined ? { is_active: numericActive } : {}),
  };

  const tryGet = async (qsObj) => {
    const qs = new URLSearchParams(qsObj).toString();
    const res = await client.get(`/utilisateurs?${qs}`);
    const { items, total } = baseNormalize(res);
    const normalized = items.map(normalizeUser);
    const finalItems = applyClientActiveFilter(normalized, is_active);
    const finalTotal = hasIsActive(is_active) ? finalItems.length : total;
    return { items: finalItems, total: finalTotal };
  };

  // 1) page/pageSize (1-based)
  if (prefer === "page") {
    try {
      const r1 = await tryGet({ page, pageSize, ...filters });
      if (r1.total > 0 || r1.items.length > 0) return r1;

      // 2) zero-based
      const r2 = await tryGet({ page: Math.max(0, page - 1), pageSize, ...filters });
      if (r2.total > 0 || r2.items.length > 0) return r2;
    // eslint-disable-next-line no-empty
    } catch {}
  }

  // 3) limit/offset
  try {
    const offset = (page - 1) * pageSize;
    const r3 = await tryGet({ limit: pageSize, offset, ...filters });
    if (r3.total > 0 || r3.items.length > 0) return r3;
  // eslint-disable-next-line no-empty
  } catch {}

  // 4) perPage/current
  try {
    const r4 = await tryGet({ perPage: pageSize, current: page, ...filters });
    if (r4.total > 0 || r4.items.length > 0) return r4;
  // eslint-disable-next-line no-empty
  } catch {}

  // 5) full list → slice client-side
  try {
    const r5 = await tryGet({ ...filters });
    const start = (page - 1) * pageSize;
    return { items: r5.items.slice(start, start + pageSize), total: r5.items.length };
  } catch {
    return { items: [], total: 0 };
  }
}
