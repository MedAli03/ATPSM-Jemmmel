export type Role = 'PARENT' | 'EDUCATEUR' | 'DIRECTEUR' | 'PRESIDENT';

export interface Enfant {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  photoUrl?: string;
  groupId?: number;
}

export interface FicheEnfant {
  enfantId: number;
  medicalNotes?: string;
  diagnosis?: string;
  supports?: string[];
}

export interface ParentsFiche {
  enfantId: number;
  guardians: Array<{
    name: string;
    relation: string;
    phone: string;
    email?: string;
  }>;
}

export interface Groupe {
  id: number;
  name: string;
  educatorId: number;
  schedule?: string;
}

export interface Inscription {
  id: number;
  enfantId: number;
  groupId: number;
  startDate: string;
  endDate?: string;
}

export interface Affectation {
  id: number;
  enfantId: number;
  educatorId: number;
  startDate: string;
  endDate?: string;
}

export interface ObservationInitiale {
  id: number;
  enfantId: number;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export interface PEI {
  id: number;
  enfantId: number;
  year: number;
  objectives: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyNote {
  id: number;
  peiId: number;
  content: string;
  mood?: string;
  createdAt: string;
}

export interface ActiviteProjet {
  id: number;
  peiId: number;
  title: string;
  description: string;
  scheduledAt: string;
}

export interface EvaluationProjet {
  id: number;
  peiId: number;
  summary: string;
  createdAt: string;
}

export interface RecommendationAI {
  id: number;
  evaluationId: number;
  items: Array<{
    id: number;
    description: string;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
}

export interface HistoriqueProjet {
  id: number;
  peiId: number;
  title: string;
  createdAt: string;
}

export interface Thread {
  id: number;
  title?: string;
  childId?: number;
  participantIds: number[];
  unreadCount: number;
  lastMessage?: Message;
  updatedAt: string;
}

export interface Message {
  id: number;
  threadId: number;
  senderId: number;
  text: string;
  createdAt: string;
  status?: 'sending' | 'sent' | 'failed' | 'read';
  attachments?: Attachment[];
  readBy?: number[];
}

export interface Attachment {
  id: number;
  name: string;
  size: number;
  mime: string;
  url?: string;
}

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
}
