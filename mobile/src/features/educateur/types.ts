// src/features/educateur/types.ts
export interface Group {
  id: number;
  nom: string;
  annee_scolaire: string;
  description?: string;
}

export interface ChildSummary {
  id: number;
  prenom: string;
  nom: string;
  date_naissance?: string;
  photo_url?: string;
}

export type ProjetEducatifIndividuelSummary = {
  id: number;
  titre: string;
  statut: "ACTIF" | "CLOTURE";
  date_debut: string;
  date_fin_prevue?: string;
  objectifs_resume?: string;
};

export interface PeiEvaluation {
  id: number;
  date: string;
  periode: string;
  commentaire_global?: string;
  note_globale?: number;
  created_by?: string;
}

export interface NewPeiEvaluationPayload {
  periode: string;
  commentaire_global?: string;
  note_globale?: number;
}
