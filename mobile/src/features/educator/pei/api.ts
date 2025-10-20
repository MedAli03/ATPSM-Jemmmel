import { z } from 'zod';

import { api } from '@lib/axios';

export const observationSchema = z.object({
  id: z.number().optional(),
  enfantId: z.number(),
  summary: z.string(),
  updatedAt: z.string().optional()
});

export const peiSchema = z.object({
  id: z.number(),
  enfantId: z.number(),
  year: z.number(),
  objectives: z.array(z.string()),
  createdAt: z.string()
});

export const dailyNoteSchema = z.object({
  id: z.number(),
  peiId: z.number(),
  content: z.string(),
  mood: z.string().nullable(),
  createdAt: z.string()
});

export const activitySchema = z.object({
  id: z.number(),
  peiId: z.number(),
  title: z.string(),
  description: z.string(),
  scheduledAt: z.string()
});

export type ObservationDto = z.infer<typeof observationSchema>;
export type PeiDto = z.infer<typeof peiSchema>;
export type DailyNoteDto = z.infer<typeof dailyNoteSchema>;
export type ActivityDto = z.infer<typeof activitySchema>;

export async function fetchObservation(childId: number): Promise<ObservationDto | null> {
  const { data } = await api.get(`/mobile/educator/pei/observation/${childId}`);
  if (!data) return null;
  return observationSchema.parse(data);
}

export async function upsertObservation(childId: number, summary: string): Promise<ObservationDto> {
  const { data } = await api.put(`/mobile/educator/pei/observation/${childId}`, { summary });
  return observationSchema.parse(data);
}

export async function fetchActivePei(childId: number): Promise<PeiDto | null> {
  const { data } = await api.get(`/mobile/educator/pei/${childId}/active`);
  if (!data) return null;
  return peiSchema.parse(data);
}

export async function createPei(childId: number, year: number, objectives: string[]): Promise<PeiDto> {
  const { data } = await api.post(`/mobile/educator/pei/${childId}`, { year, objectives });
  return peiSchema.parse(data);
}

export async function listDailyNotes(peiId: number): Promise<DailyNoteDto[]> {
  const { data } = await api.get(`/mobile/educator/pei/${peiId}/daily-notes`);
  return z.array(dailyNoteSchema).parse(data);
}

export async function createDailyNote(
  peiId: number,
  payload: { content: string; mood?: string | null }
): Promise<DailyNoteDto> {
  const { data } = await api.post(`/mobile/educator/pei/${peiId}/daily-notes`, payload);
  return dailyNoteSchema.parse(data);
}

export async function listActivities(peiId: number): Promise<ActivityDto[]> {
  const { data } = await api.get(`/mobile/educator/pei/${peiId}/activities`);
  return z.array(activitySchema).parse(data);
}

export async function createActivity(
  peiId: number,
  payload: { title: string; description: string; scheduledAt: string }
): Promise<ActivityDto> {
  const { data } = await api.post(`/mobile/educator/pei/${peiId}/activities`, payload);
  return activitySchema.parse(data);
}
