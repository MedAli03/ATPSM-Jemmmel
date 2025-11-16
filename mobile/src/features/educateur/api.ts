// src/features/educateur/api.ts
import axios from "axios";
import { api } from "../../services/api";
import {
  ChildSummary,
  Group,
  NewPeiEvaluationPayload,
  PeiEvaluation,
  ProjetEducatifIndividuelSummary,
} from "./types";

export const getMyGroups = async (): Promise<Group[]> => {
  const response = await api.get<Group[]>("/educateurs/me/groupes");
  return response.data;
};

export const getGroupChildren = async (groupId: number): Promise<ChildSummary[]> => {
  const response = await api.get<ChildSummary[]>(`/groupes/${groupId}/enfants`);
  return response.data;
};

export const getActivePeiForChild = async (
  childId: number,
): Promise<ProjetEducatifIndividuelSummary | null> => {
  try {
    const response = await api.get<ProjetEducatifIndividuelSummary>(
      `/enfants/${childId}/pei/actif`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getPeiEvaluations = async (
  peiId: number,
): Promise<PeiEvaluation[]> => {
  const response = await api.get<PeiEvaluation[]>(`/pei/${peiId}/evaluations`);
  return response.data;
};

export const createPeiEvaluation = async (
  peiId: number,
  payload: NewPeiEvaluationPayload,
): Promise<PeiEvaluation> => {
  const response = await api.post<PeiEvaluation>(
    `/pei/${peiId}/evaluations`,
    payload,
  );
  return response.data;
};
