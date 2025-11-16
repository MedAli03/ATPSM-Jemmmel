// src/features/parent/types.ts
export type TimelineItemType = "NOTE" | "ACTIVITE" | "EVALUATION";

export interface Child {
  id: number;
  prenom: string;
  nom: string;
  date_naissance: string;
  diagnostic?: string;
  photo_url?: string;
}

export interface TimelineItem {
  id: number;
  type: TimelineItemType;
  date: string;
  titre: string;
  description?: string;
  created_by?: string;
}
