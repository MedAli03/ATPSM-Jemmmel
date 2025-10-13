import client from "./client";

function normalizeNotification(row) {
  if (!row) return null;
  const type = (row.type || "info").toLowerCase();
  const title = row.title || row.titre || "";
  const body = row.body || row.corps || "";
  const createdAt = row.created_at || row.createdAt || row.time || null;
  return {
    id: String(row.id ?? ""),
    type,
    title,
    body,
    text:
      row.text ||
      (title && body ? `${title} — ${body}` : title || body || "إشعار جديد"),
    read: Boolean(row.read ?? row.read_at ?? row.lu_le),
    readAt: row.read_at || row.lu_le || null,
    createdAt,
    updatedAt: row.updated_at || row.updatedAt || null,
    icon: row.icon || null,
    actionUrl: row.action_url || row.actionUrl || null,
    payload: row.payload || row.data || null,
  };
}

export async function listNotifications(options = {}) {
  const {
    page = 1,
    pageSize = 10,
    limit,
    q = "",
    status = "all",
    type = "all",
  } = options;

  const params = {
    page,
    limit: limit ?? pageSize,
  };
  if (q) params.q = q;
  if (status === "unread") params.only_unread = true;
  if (type && type !== "all") params.type = type;

  const { data } = await client.get("/notifications/me", { params });

  const payload = data?.data ?? data ?? {};
  const meta = data?.meta || payload?.meta || {};
  const itemsRaw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

  const items = itemsRaw
    .map((row) => normalizeNotification(row))
    .filter(Boolean);

  return {
    items,
    meta: {
      page: meta.page ?? page,
      limit: meta.limit ?? (limit ?? pageSize),
      total: meta.total ?? items.length,
      unread: meta.unread ?? null,
    },
  };
}

export async function getRecentNotifications(limit = 8) {
  const { items } = await listNotifications({ page: 1, limit });
  return items.slice(0, limit);
}

export async function getUnreadCount() {
  const { data } = await client.get("/notifications/me/unread-count");
  const root = data?.data ?? data;
  if (typeof root === "number") return root;
  return root?.count ?? 0;
}

export async function markNotificationRead(id) {
  const { data } = await client.patch(`/notifications/${id}/read`);
  const payload = data?.data ?? data ?? {};
  const meta = data?.meta ?? {};
  return {
    notification: normalizeNotification(payload),
    meta,
  };
}

export async function markAllNotificationsRead() {
  const { data } = await client.post("/notifications/mark-all-read");
  const payload = data?.data ?? data ?? {};
  const meta = data?.meta ?? {};
  return {
    updated: payload?.updated ?? payload ?? 0,
    meta,
  };
}

export async function deleteNotification(id) {
  const { data } = await client.delete(`/notifications/${id}`);
  return data?.data ?? data ?? { deleted: true };
}

export { normalizeNotification };
