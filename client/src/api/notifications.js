import client from "./client";

/**
 * Tries /recent?limit=... first.
 * If 404, falls back to /actualites/latest and /events/upcoming, then normalizes.
 * Options: { page, pageSize, q, status, type }
 * - status: 'all' | 'unread' | 'read' (client-side only; backend not specified)
 * - type: 'all' | 'news' | 'event' | 'reminder' | 'info'
 */
export async function fetchNotifications(options = {}) {
  const {
    page = 1,
    pageSize = 10,
    q = "",
    status = "all",
    type = "all",
    // safety cap in case backend returns many items
    hardLimit = 200,
  } = options;

  // 1) Try /recent
  try {
    const limit = Math.min(page * pageSize, hardLimit);
    const { data } = await client.get(`/recent?limit=${limit}`);
    const raw = data?.data ?? [];
    return postProcess(raw, { page, pageSize, q, status, type });
  } catch (e) {
    // 2) Fallback: merge news + events
    if (e.response?.status !== 404) {
      // Unknown error: empty-safe
      return { items: [], total: 0, page, pageSize };
    }
    const [act, ev] = await Promise.allSettled([
      client.get(`/actualites/latest?limit=${hardLimit}`),
      client.get(`/events/upcoming?limit=${hardLimit}`),
    ]);

    const news = act.status === "fulfilled" ? act.value?.data?.data ?? [] : [];
    const events = ev.status === "fulfilled" ? ev.value?.data?.data ?? [] : [];

    // normalize to common model
    const mappedNews = news.map((n) => ({
      id: `news-${n.id}`,
      type: "news",
      title: n.titre || "خبر",
      content: n.contenu || "",
      time: n.publie_le || n.created_at || n.date || "",
      read: false,
    }));
    const mappedEvents = events.map((e) => ({
      id: `event-${e.id}`,
      type: "event",
      title: e.titre || "فعالية",
      content: "",
      time: e.debut || e.created_at || e.date || "",
      read: false,
    }));

    const merged = [...mappedNews, ...mappedEvents];

    return postProcess(merged, { page, pageSize, q, status, type });
  }
}

function postProcess(raw, { page, pageSize, q, status, type }) {
  const normalized = raw.map((row, idx) => ({
    id: String(row.id ?? idx),
    type: row.type || row.kind || row.category || "info",
    title: row.title || row.titre || row.name || "",
    content: row.content || row.contenu || row.body || row.description || "",
    time: row.time || row.publie_le || row.debut || row.created_at || row.createdAt || row.date || "",
    read: Boolean(row.read ?? row.is_read ?? false),
  }));

  // sort by date desc if possible
  const sorted = normalized.sort((a, b) => {
    const ad = Date.parse(a.time || "") || 0;
    const bd = Date.parse(b.time || "") || 0;
    return bd - ad;
  });

  // filters
  let filtered = sorted;
  if (q?.trim()) {
    const needle = q.trim().toLowerCase();
    filtered = filtered.filter(
      (x) =>
        x.title?.toLowerCase().includes(needle) ||
        x.content?.toLowerCase().includes(needle)
    );
  }
  if (status === "unread") filtered = filtered.filter((x) => !x.read);
  if (status === "read") filtered = filtered.filter((x) => x.read);
  if (type !== "all") filtered = filtered.filter((x) => x.type === type);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);

  return { items, total, page, pageSize };
}
