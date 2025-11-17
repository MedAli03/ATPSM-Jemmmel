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

export interface ObservationInitialeDto {
  id: number;
  enfant_id: number;
  educateur_id: number;
  date_observation: string;
  contenu: string;
  created_at?: string;
  updated_at?: string;
}

export interface ObservationInitialePayload {
  enfant_id: number;
  date_observation: string;
  contenu: string;
}

type ObservationListResponse = {
  ok?: boolean;
  rows: ObservationInitialeDto[];
  count: number;
  page: number;
  limit: number;
};

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

export const getLatestObservationInitiale = async (
  enfantId: number,
): Promise<ObservationInitialeDto | null> => {
  const response = await api.get<ObservationListResponse>("/observation", {
    params: {
      enfant_id: enfantId,
      limit: 1,
      page: 1,
    },
  });

  const rows = response.data?.rows ?? [];
  return rows.length > 0 ? rows[0] : null;
};

export const createObservationInitiale = async (
  payload: ObservationInitialePayload,
): Promise<ObservationInitialeDto> => {
  const response = await api.post<{ ok: boolean; data: ObservationInitialeDto }>(
    "/observation",
    payload,
  );
  return response.data.data;
};

export const updateObservationInitiale = async (
  observationId: number,
  payload: Partial<Omit<ObservationInitialePayload, "enfant_id">>,
): Promise<ObservationInitialeDto> => {
  const response = await api.put<{ ok: boolean; data: ObservationInitialeDto }>(
    `/observation/${observationId}`,
    payload,
  );
  return response.data.data;
};
