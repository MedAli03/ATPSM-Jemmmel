// src/features/parent/types.ts
export type TimelineItemType = "daily_note" | "activity" | "evaluation" | "pei";

export interface ParentContact {
  id: number;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
}

export interface ChildGroupSummary {
  id: number;
  nom: string;
  annee?: string | null;
  educateur?: { id: number; nom?: string | null; prenom?: string | null } | null;
}

export interface ChildPeiSummary {
  id: number;
  statut: string;
  objectifs?: string | null;
  date_validation?: string | null;
}

export interface Child {
  id: number;
  prenom: string;
  nom: string;
  date_naissance: string;
  diagnostic?: string | null;
  besoins_specifiques?: string | null;
  allergies?: string | null;
  photo_url?: string | null;
  groupe_actuel?: ChildGroupSummary | null;
  educateur_referent?: { id: number; nom?: string | null; prenom?: string | null } | null;
  active_pei?: ChildPeiSummary | null;
  parent?: ParentContact | null;
  last_note_date?: string | null;
  last_note_preview?: string | null;
  thread_id?: number | null;
}

export interface TimelineItem {
  id: string | number;
  type: TimelineItemType;
  date: string;
  title: string;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface ThreadParticipant {
  id: number;
  name?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

export interface ThreadMessage {
  id: number;
  threadId: number;
  text?: string | null;
  kind?: string | null;
  createdAt: string;
  sender?: { id: number; name?: string | null; role?: string | null } | null;
  readBy?: number[];
}

export interface MessageThread {
  id: number;
  title?: string | null;
  updatedAt?: string | null;
  unreadCount: number;
  archived?: boolean;
  participants: ThreadParticipant[];
  lastMessage?: ThreadMessage | null;
  child?: { id: number; nom?: string | null; prenom?: string | null } | null;
}

export interface ParentNotification {
  id: number;
  titre: string;
  corps?: string | null;
  type?: string | null;
  created_at: string;
  read_at?: string | null;
  metadata?: Record<string, unknown> | null;
}
