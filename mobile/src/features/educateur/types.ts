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

export type PeiStatus =
  | "VALIDE"
  | "CLOTURE"
  | "EN_ATTENTE_VALIDATION"
  | "REFUSE";

export type ProjetEducatifIndividuelSummary = {
  id: number;
  enfant_id: number;
  enfant_nom_complet?: string;
  titre: string;
  statut: PeiStatus;
  date_debut: string;
  date_fin_prevue?: string;
  objectifs_resume?: string;
};

export interface PeiDetails extends ProjetEducatifIndividuelSummary {
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
  date_evaluation: string;
  score: number;
  notes?: string;
}

export interface CreatePeiPayload {
  enfant_id: number;
  educateur_id: number;
  annee_id: number;
  date_creation: string;
  objectifs?: string;
  precedent_projet_id?: number;
}

export type UpdatePeiPayload = {
  objectifs?: string | null;
  statut?: PeiStatus;
  date_derniere_maj?: string;
};

export interface CreatePeiActivityPayload {
  titre: string;
  description?: string;
  objectifs?: string;
  type?: "atelier" | "jeu" | "autre";
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

export interface PeiActivitySummary {
  id: number;
  date: string;
  titre?: string | null;
  type?: string | null;
  description?: string | null;
  objectifs?: string | null;
  educateur?: string;
}

export interface ThreadParticipantSummary {
  id: number;
  name?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

export interface ThreadMessage {
  id: number;
  threadId: number;
  kind?: string | null;
  text?: string | null;
  createdAt: string;
  sender?: { id: number; name?: string | null; role?: string | null } | null;
  readBy?: number[];
}

export interface MessageThreadSummary {
  id: number;
  title?: string | null;
  updatedAt?: string | null;
  unreadCount: number;
  isGroup?: boolean;
  archived?: boolean;
  lastMessage?: ThreadMessage | null;
  participants: ThreadParticipantSummary[];
}

export type MessageCursor = { id: string; createdAt: string };
