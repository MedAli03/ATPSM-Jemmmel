// src/features/educateur/hooks.ts
import { useCallback, useEffect, useState } from "react";
import {
  ForbiddenError,
  getActivePeiForChild,
  getChildrenByGroup,
  getMyGroups,
  getPeiEvaluations,
} from "./api";
import {
  ChildSummary,
  Group,
  PeiEvaluation,
  ProjetEducatifIndividuelSummary,
} from "./types";

const getErrorMessage = (error: unknown) => {
  if (error instanceof ForbiddenError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Une erreur est survenue";
};

export const useMyGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyGroups({ includeHistory: true });
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, error, refetch: fetchGroups };
};

export const useGroupChildren = (groupId: number) => {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    if (!groupId) {
      return;
    }
    setLoading(true);
    try {
      const data = await getChildrenByGroup(groupId);
      setChildren(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return { children, loading, error, refetch: fetchChildren };
};

export const useActivePei = (childId: number) => {
  const [pei, setPei] = useState<ProjetEducatifIndividuelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPei = useCallback(async () => {
    if (!childId) {
      return;
    }
    setLoading(true);
    try {
      const data = await getActivePeiForChild(childId);
      setPei(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchPei();
  }, [fetchPei]);

  return { pei, loading, error, refetch: fetchPei };
};

export const usePeiEvaluations = (peiId: number) => {
  const [evaluations, setEvaluations] = useState<PeiEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvaluations = useCallback(async () => {
    if (!peiId) {
      return;
    }
    setLoading(true);
    try {
      const data = await getPeiEvaluations(peiId);
      setEvaluations(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [peiId]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  return { evaluations, loading, error, refetch: fetchEvaluations };
};
