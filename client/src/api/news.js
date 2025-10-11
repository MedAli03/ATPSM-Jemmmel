// src/api/news.js
import client from "./client";

/** Helpers to normalize API that returns either {ok:true,data} or raw array/object */
const pick = (res) => {
  const d = res?.data;
  if (!d) return null;
  if (Array.isArray(d)) return d;
  if (d?.data != null) return d.data;
  return d;
};

/* =========================
   List / CRUD
   ========================= */
export async function listNews({ search = "", status = "all", page = 1, limit = 10, pinnedOnly = false } = {}) {
  const params = {};
  if (search) params.search = search;
  if (status && status !== "all") params.status = status; // "draft" | "published"
  if (pinnedOnly) params.pinned = 1;
  params.page = page;
  params.limit = limit;

  const res = await client.get("/news", { params });
  const data = pick(res);
  // Accept both paged and non-paged responses
  if (Array.isArray(data)) return { items: data, total: data.length, page, limit };
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    total: Number(data?.total ?? 0),
    page: Number(data?.page ?? page),
    limit: Number(data?.limit ?? limit),
  };
}

export async function getNews(id) {
  const res = await client.get(`/news/${id}`);
  return pick(res);
}

export async function createNews(payload) {
  // payload: { title, content, status?, pinned? }
  const res = await client.post("/news", payload);
  return pick(res);
}

export async function updateNews(id, payload) {
  const res = await client.put(`/news/${id}`, payload);
  return pick(res);
}

export async function deleteNews(id) {
  const res = await client.delete(`/news/${id}`);
  return pick(res);
}

/* =========================
   Actions
   ========================= */
export async function setPublish(id, published) {
  // prefer PATCH /news/:id/publish { published }
  // fallback to PUT if needed by your backend
  try {
    const res = await client.patch(`/news/${id}/publish`, { published: !!published });
    return pick(res);
  } catch {
    const res = await client.put(`/news/${id}`, { status: published ? "published" : "draft" });
    return pick(res);
  }
}

export async function setPinned(id, pinned) {
  // prefer PATCH /news/:id/pin { pinned }
  try {
    const res = await client.patch(`/news/${id}/pin`, { pinned: !!pinned });
    return pick(res);
  } catch {
    // fallback to PUT merge
    const resGet = await client.get(`/news/${id}`);
    const current = pick(resGet) || {};
    const resPut = await client.put(`/news/${id}`, { ...current, pinned: !!pinned });
    return pick(resPut);
  }
}
