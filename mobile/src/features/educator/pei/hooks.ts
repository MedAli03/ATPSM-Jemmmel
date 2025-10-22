import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useProtectedQuery } from '@hooks/useProtectedQuery';

import {
  fetchObservation,
  upsertObservation,
  fetchActivePei,
  createPei,
  listDailyNotes,
  createDailyNote,
  listActivities,
  createActivity,
  ObservationDto,
  PeiDto,
  DailyNoteDto,
  ActivityDto
} from './api';

export function useObservation(childId: number) {
  return useProtectedQuery<ObservationDto | null>({
    queryKey: ['pei-observation', childId],
    queryFn: () => fetchObservation(childId),
    enabled: childId > 0
  });
}

export function useUpsertObservation(childId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (summary: string) => upsertObservation(childId, summary),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pei-observation', childId] });
    }
  });
}

export function useActivePei(childId: number) {
  return useProtectedQuery<PeiDto | null>({
    queryKey: ['pei-active', childId],
    queryFn: () => fetchActivePei(childId),
    enabled: childId > 0
  });
}

export function useCreatePei(childId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { year: number; objectives: string[] }) =>
      createPei(childId, payload.year, payload.objectives),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pei-active', childId] });
    }
  });
}

export function useDailyNotes(peiId: number) {
  return useProtectedQuery<DailyNoteDto[]>({
    queryKey: ['pei-notes', peiId],
    queryFn: () => listDailyNotes(peiId),
    enabled: peiId > 0
  });
}

export function useCreateDailyNote(peiId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; mood?: string | null }) =>
      createDailyNote(peiId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pei-notes', peiId] });
    }
  });
}

export function useActivities(peiId: number) {
  return useProtectedQuery<ActivityDto[]>({
    queryKey: ['pei-activities', peiId],
    queryFn: () => listActivities(peiId),
    enabled: peiId > 0
  });
}

export function useCreateActivity(peiId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; description: string; scheduledAt: string }) =>
      createActivity(peiId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pei-activities', peiId] });
    }
  });
}
