// src/api/evenements.js
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";

const BASE_PATH = "/api/evenements";

function extract(res) {
  const payload = res?.data;
  return {
    data: payload?.data ?? null,
    meta: payload?.meta ?? null,
    page: payload?.page ?? payload?.meta?.page ?? null,
    total: payload?.total ?? payload?.meta?.total ?? null,
    limit: payload?.limit ?? payload?.meta?.limit ?? null,
  };
}

export async function listEvenements({
  search = "",
  type,
  statut,
  annee_id,
  groupe_id,
  date_from,
  date_to,
  page = 1,
  limit = 10,
} = {}) {
  const params = { page, limit };

  if (search) params.search = search;
  if (type) params.type = type;
  if (statut) params.statut = statut;
  if (annee_id) params.annee_id = annee_id;
  if (groupe_id) params.groupe_id = groupe_id;
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;

  const res = await client.get(BASE_PATH, { params });
  const { data, total, page: currentPage, limit: currentLimit } = extract(res);

  return {
    items: Array.isArray(data) ? data : [],
    meta: {
      total: Number(total ?? 0),
      page: Number(currentPage ?? page ?? 1),
      limit: Number(currentLimit ?? limit ?? 10),
    },
  };
}

export async function fetchCalendarEvents({ start, end, annee_id, groupe_id } = {}) {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  if (annee_id) params.annee_id = annee_id;
  if (groupe_id) params.groupe_id = groupe_id;

  const res = await client.get(`${BASE_PATH}/calendar`, { params });
  const payload = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(payload) ? payload : [];
}

export async function getEvenement(id) {
  if (!id) throw new Error("id is required");
  const res = await client.get(`${BASE_PATH}/${id}`);
  return extract(res).data;
}

export async function createEvenement(payload) {
  const res = await client.post(BASE_PATH, payload);
  return extract(res).data;
}

export async function updateEvenement(id, payload) {
  const res = await client.put(`${BASE_PATH}/${id}`, payload);
  return extract(res).data;
}

export async function publishEvenement(id) {
  const res = await client.post(`${BASE_PATH}/${id}/publish`);
  return extract(res).data;
}

export async function cancelEvenement(id) {
  const res = await client.post(`${BASE_PATH}/${id}/cancel`);
  return extract(res).data;
}

export async function fetchAttendees(id) {
  const res = await client.get(`${BASE_PATH}/${id}/attendees`);
  const payload = res?.data?.data ?? res?.data ?? [];
  return Array.isArray(payload) ? payload : [];
}

export async function rsvpEvenement(id, body) {
  const res = await client.post(`${BASE_PATH}/${id}/rsvp`, body);
  return extract(res).data;
}

export function useEventsQuery(params = {}, options = {}) {
  const queryKey = useMemo(() => ["evenements", "list", params], [params]);
  return useQuery({
    queryKey,
    queryFn: () => listEvenements(params),
    keepPreviousData: true,
    ...options,
  });
}

export function useCalendarEventsQuery(params = {}, options = {}) {
  const queryKey = useMemo(() => ["evenements", "calendar", params], [params]);
  return useQuery({
    queryKey,
    queryFn: () => fetchCalendarEvents(params),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useEvent(id, options = {}) {
  return useQuery({
    queryKey: ["evenements", "item", id],
    queryFn: () => getEvenement(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useCreateEvent(options = {}) {
  const qc = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: createEvenement,
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["evenements"] });
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}

export function useUpdateEvent(options = {}) {
  const qc = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: ({ id, payload }) => updateEvenement(id, payload),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["evenements"] });
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ["evenements", "item", variables.id] });
      }
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}

export function usePublishEvent(options = {}) {
  const qc = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: (id) => publishEvenement(id),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["evenements"] });
      if (variables) {
        qc.invalidateQueries({ queryKey: ["evenements", "item", variables] });
      }
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}

export function useCancelEvent(options = {}) {
  const qc = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: (id) => cancelEvenement(id),
    onSuccess: (data, variables, context) => {
      qc.invalidateQueries({ queryKey: ["evenements"] });
      if (variables) {
        qc.invalidateQueries({ queryKey: ["evenements", "item", variables] });
      }
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}

export function useAttendees(id, options = {}) {
  return useQuery({
    queryKey: ["evenements", "attendees", id],
    queryFn: () => fetchAttendees(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useRsvp(id, options = {}) {
  const qc = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    mutationFn: (body) => rsvpEvenement(id, body),
    onSuccess: (data, variables, context) => {
      if (id) {
        qc.invalidateQueries({ queryKey: ["evenements", "attendees", id] });
        qc.invalidateQueries({ queryKey: ["evenements", "item", id] });
      }
      onSuccess?.(data, variables, context);
    },
    ...rest,
  });
}
