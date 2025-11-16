// src/features/parent/api.ts
import { api } from "../../services/api";
import { Child, TimelineItem } from "./types";

export const getMyChildren = async (): Promise<Child[]> => {
  const response = await api.get<Child[]>("/parents/me/enfants");
  return response.data;
};

export const getChildById = async (childId: number): Promise<Child> => {
  const response = await api.get<Child>(`/enfants/${childId}`);
  return response.data;
};

export const getChildTimeline = async (childId: number): Promise<TimelineItem[]> => {
  const response = await api.get<TimelineItem[]>(`/enfants/${childId}/timeline`);
  return response.data;
};
