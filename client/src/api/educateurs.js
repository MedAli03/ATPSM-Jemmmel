// src/api/educateurs.js
import client from "./client";

function unwrap(res) {
  const payload = res?.data;
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && typeof payload.data === "object") {
      if (Array.isArray(payload.data.items)) return payload.data.items;
      return payload.data;
    }
    return payload;
  }
  return payload;
}

function normalizeList(res) {
  const payload = res?.data;
  if (!payload) {
    return { items: [], meta: { page: 1, limit: 10, total: 0 } };
  }

  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: { page: 1, limit: payload.length, total: payload.length },
    };
  }

  if (payload.data) {
    if (Array.isArray(payload.data)) {
      return {
        items: payload.data,
        meta: payload.meta || { page: 1, limit: payload.data.length, total: payload.data.length },
      };
    }

    if (typeof payload.data === "object") {
      return {
        items: Array.isArray(payload.data.items)
          ? payload.data.items
          : Array.isArray(payload.data.data)
          ? payload.data.data
          : [],
        meta:
          payload.data.meta ||
          payload.meta || {
            page: payload.data.page || 1,
            limit: payload.data.limit || 10,
            total: payload.data.total || 0,
          },
      };
    }
  }

  if (Array.isArray(payload.items)) {
    return { items: payload.items, meta: payload.meta || {} };
  }

  return {
    items: [],
    meta: payload.meta || { page: payload.page || 1, limit: payload.limit || 10, total: payload.total || 0 },
  };
}

export async function listEducateurs({ search, status, annee_id, page = 1, limit = 10 } = {}) {
  const params = {};
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (annee_id) params.annee_id = annee_id;
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const res = await client.get("/educateurs", { params });
  return normalizeList(res);
}

export async function getEducateur(id) {
  const res = await client.get(`/educateurs/${id}`);
  return unwrap(res);
}

export async function createEducateur(payload) {
  const res = await client.post("/educateurs", payload);
  return unwrap(res);
}

export async function updateEducateur(id, payload) {
  const res = await client.put(`/educateurs/${id}`, payload);
  return unwrap(res);
}

export async function archiveEducateur(id) {
  const res = await client.post(`/educateurs/${id}/archive`);
  return unwrap(res);
}

export async function unarchiveEducateur(id) {
  const res = await client.post(`/educateurs/${id}/unarchive`);
  return unwrap(res);
}
