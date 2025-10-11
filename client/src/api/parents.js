// src/api/parents.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";

function normalizeChild(raw = {}) {
  if (!raw || typeof raw !== "object") return raw;
  return {
    id: raw.id,
    nom: raw.nom || "",
    prenom: raw.prenom || "",
    date_naissance: raw.date_naissance || null,
    groupe_actif: raw.groupe_actif || null,
  };
}

function normalizeParent(raw = {}) {
  if (!raw || typeof raw !== "object") return raw;
  const children = Array.isArray(raw.enfants) ? raw.enfants.map(normalizeChild) : [];
  const total = raw.children_count ?? children.length;
  const isActive = raw.is_active !== false;
  return {
    id: raw.id,
    nom: raw.nom || "",
    prenom: raw.prenom || "",
    email: raw.email || "",
    telephone: raw.telephone || "",
    adresse: raw.adresse || "",
    children_count: total,
    enfants: children,
    is_active: isActive,
    status: isActive ? "active" : "archived",
    updated_at: raw.updated_at || raw.updatedAt || null,
    missing_contact: Boolean(raw.missing_contact),
  };
}

function normalizeMeta(meta = {}, fallback = {}) {
  return {
    page: Number(meta.page ?? fallback.page ?? 1),
    limit: Number(meta.limit ?? fallback.limit ?? 10),
    total: Number(meta.total ?? fallback.total ?? 0),
  };
}

function sanitizePayload(payload = {}, { includePassword = true } = {}) {
  const body = { ...payload };
  if (typeof body.nom === "string") body.nom = body.nom.trim();
  if (typeof body.prenom === "string") body.prenom = body.prenom.trim();
  if (typeof body.email === "string") body.email = body.email.trim();
  if (typeof body.telephone === "string") body.telephone = body.telephone.trim();
  if (typeof body.adresse === "string") body.adresse = body.adresse.trim();
  if (!includePassword) delete body.mot_de_passe;
  if (includePassword && typeof body.mot_de_passe === "string") {
    body.mot_de_passe = body.mot_de_passe.trim();
  }
  if (body.mot_de_passe === "") delete body.mot_de_passe;
  return body;
}

export async function listParents({
  search,
  status = "all",
  has_contact = "any",
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };
  if (search) params.search = search;
  if (status && status !== "all") params.status = status;
  if (has_contact && has_contact !== "any") params.has_contact = has_contact;
  const res = await client.get("/parents", { params });
  const payload = res?.data || {};
  const items = Array.isArray(payload.data)
    ? payload.data.map(normalizeParent)
    : [];
  const meta = normalizeMeta(payload.meta, { page, limit, total: items.length });
  return { items, meta };
}

export async function getParent(id) {
  if (!id) return null;
  const res = await client.get(`/parents/${id}`);
  const payload = res?.data || {};
  return normalizeParent(payload.data || payload);
}

export async function createParent(payload) {
  const body = sanitizePayload(payload, { includePassword: true });
  const res = await client.post("/parents", body);
  const data = res?.data || {};
  return normalizeParent(data.data || data);
}

export async function updateParent(id, payload) {
  const body = sanitizePayload(payload, { includePassword: false });
  const res = await client.put(`/parents/${id}`, body);
  const data = res?.data || {};
  return normalizeParent(data.data || data);
}

export async function archiveParent(id) {
  const res = await client.post(`/parents/${id}/archive`);
  const data = res?.data || {};
  return normalizeParent(data.data || data);
}

export async function unarchiveParent(id) {
  const res = await client.post(`/parents/${id}/unarchive`);
  const data = res?.data || {};
  return normalizeParent(data.data || data);
}

export async function linkChild(parentId, enfantId) {
  const res = await client.post(`/parents/${parentId}/link-child`, {
    enfant_id: enfantId,
  });
  const data = res?.data || {};
  return normalizeParent(data.data || data);
}

export async function unlinkChild(parentId, enfantId) {
  const res = await client.delete(
    `/parents/${parentId}/unlink-child/${enfantId}`
  );
  const data = res?.data || {};
  return normalizeParent(data.data || data);
}

export async function searchChildren(query) {
  if (!query) return [];
  const res = await client.get("/enfants/search", { params: { query } });
  const payload = res?.data || {};
  const items = Array.isArray(payload.data) ? payload.data : [];
  return items.map((item) => ({
    id: item.id,
    nom: item.nom,
    prenom: item.prenom,
    date_naissance: item.date_naissance,
    parent_user_id: item.parent_user_id,
  }));
}

export function useParentsQuery(filters) {
  return useQuery({
    queryKey: ["parents", filters],
    queryFn: () => listParents(filters),
    keepPreviousData: true,
  });
}

export function useParent(id, options = {}) {
  return useQuery({
    queryKey: ["parents", "detail", id],
    queryFn: () => getParent(id),
    enabled: Boolean(id) && (options.enabled ?? true),
  });
}

export function useCreateParent(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createParent,
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["parents"] });
      options.onSuccess?.(data, variables, context);
    },
  });
}

export function useUpdateParent(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateParent(id, data),
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["parents"] });
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ["parents", "detail", variables.id] });
      }
      options.onSuccess?.(data, variables, context);
    },
  });
}

export function useArchiveParent(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveParent,
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["parents"] });
      options.onSuccess?.(data, variables, context);
    },
  });
}

export function useUnarchiveParent(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unarchiveParent,
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["parents"] });
      options.onSuccess?.(data, variables, context);
    },
  });
}

export function useLinkChild(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, enfantId }) => linkChild(parentId, enfantId),
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["parents"] });
      if (variables?.parentId) {
        qc.invalidateQueries({ queryKey: ["parents", "detail", variables.parentId] });
      }
      options.onSuccess?.(data, variables, context);
    },
  });
}

export function useUnlinkChild(options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, enfantId }) => unlinkChild(parentId, enfantId),
    ...options,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["parents"] });
      if (variables?.parentId) {
        qc.invalidateQueries({ queryKey: ["parents", "detail", variables.parentId] });
      }
      options.onSuccess?.(data, variables, context);
    },
  });
}
