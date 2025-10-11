// src/api/news.js
import client from "./client";

const BASE_PATH = "/actualites";

function extract(res) {
  const payload = res?.data;
  return {
    data: payload?.data ?? null,
    meta: payload?.meta ?? null,
  };
}

export async function listNews({
  search = "",
  status = "all",
  pinnedOnly = false,
  from,
  to,
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (pinnedOnly) params.pinned = true;
  if (from) params.from = from;
  if (to) params.to = to;

  const res = await client.get(BASE_PATH, { params });
  const { data, meta } = extract(res);

  return {
    items: Array.isArray(data) ? data : [],
    meta: {
      total: Number(meta?.total ?? 0),
      page: Number(meta?.page ?? page),
      limit: Number(meta?.limit ?? limit),
    },
  };
}

export async function getNews(id) {
  const res = await client.get(`${BASE_PATH}/${id}`);
  return extract(res).data;
}

export async function createNews(payload) {
  const res = await client.post(BASE_PATH, payload);
  return extract(res).data;
}

export async function updateNews(id, payload) {
  const res = await client.put(`${BASE_PATH}/${id}`, payload);
  return extract(res).data;
}

export async function deleteNews(id) {
  const res = await client.delete(`${BASE_PATH}/${id}`);
  return extract(res).data;
}

export async function updateNewsStatus(id, body) {
  const res = await client.patch(`${BASE_PATH}/${id}/status`, body);
  return extract(res).data;
}

export async function toggleNewsPin(id, epingle) {
  const res = await client.patch(`${BASE_PATH}/${id}/pin`, { epingle });
  return extract(res).data;
}
