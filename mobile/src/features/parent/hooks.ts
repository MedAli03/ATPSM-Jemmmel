// src/features/parent/hooks.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { getChildById, getChildTimeline, getMyChildren } from "./api";
import { Child, TimelineItem } from "./types";

interface HookState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const useAsyncData = <T,>(fetcher: () => Promise<T>): HookState<T | null> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
};

export const useMyChildren = (): HookState<Child[]> => {
  const fetcher = useCallback(() => getMyChildren(), []);
  const state = useAsyncData<Child[]>(fetcher);
  return {
    ...state,
    data: state.data ?? [],
  };
};

export const useChildDetail = (childId: number): HookState<Child | null> => {
  const fetcher = useCallback(() => getChildById(childId), [childId]);
  return useAsyncData<Child>(fetcher);
};

export const useChildTimeline = (
  childId: number,
): HookState<TimelineItem[]> => {
  const fetcher = useCallback(() => getChildTimeline(childId), [childId]);
  const state = useAsyncData<TimelineItem[]>(fetcher);
  const sortedData = useMemo(() => {
    if (!state.data) {
      return [] as TimelineItem[];
    }
    return [...state.data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [state.data]);

  return {
    ...state,
    data: sortedData,
  };
};
