// src/features/educateur/types.ts
export interface SchoolYear {
  id: number;
  libelle: string;
  date_debut: string;
  date_fin: string;
}

export interface Group {
  id: number;
  nom: string;
  annee_id: number;
  annee_scolaire?: string;
  description?: string | null;
  statut?: "actif" | "archive";
  nb_enfants?: number;
}

export interface ChildSummary {
  id: number;
  prenom: string;
  nom: string;
  date_naissance?: string | null;
  photo_url?: string | null;
}

export interface ChildDetails extends ChildSummary {
  sexe?: string | null;
  lieu_naissance?: string | null;
  diagnostic?: string | null;
  besoins_specifiques?: string | null;
  allergies?: string | null;
  description?: string | null;
}

export type ProjetEducatifIndividuelSummary = {
  id: number;
  titre: string;
  statut: "ACTIF" | "CLOTURE" | "BROUILLON";
  date_debut: string;
  date_fin_prevue?: string;
  objectifs_resume?: string;
};

export interface PeiDetails extends ProjetEducatifIndividuelSummary {
  enfant_id: number;
  educateur_id: number;
  annee_id: number;
  date_derniere_maj?: string;
  objectifs?: string | null;
}

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

export interface CreatePeiPayload {
  enfant_id: number;
  educateur_id: number;
  annee_id: number;
  date_creation: string;
  objectifs?: string;
  statut?: "brouillon" | "actif" | "clos";
  precedent_projet_id?: number;
}

export type UpdatePeiPayload = Partial<Pick<CreatePeiPayload, "objectifs" | "statut">> & {
  date_derniere_maj?: string;
};

export interface CreatePeiActivityPayload {
  titre: string;
  description?: string;
  objectifs?: string;
  type?: "atelier" | "jeu" | "reco" | "autre";
  date_activite: string;
  enfant_id: number;
}

export interface CreateDailyNotePayload {
  peiId: number;
  date_note: string;
  contenu?: string;
  type?: string;
  pieces_jointes?: string;
}

export interface ChildHistoryEvent {
  id: string;
  type: "activity" | "evaluation" | "daily_note";
  date: string;
  title: string;
  description?: string;
  meta?: Record<string, unknown>;
}
