// src/features/educateur/api.ts
import { api } from "../../services/api";
import {
  ChildDetails,
  ChildHistoryEvent,
  ChildSummary,
  CreateDailyNotePayload,
  CreatePeiActivityPayload,
  CreatePeiPayload,
  Group,
  NewPeiEvaluationPayload,
  PeiDetails,
  PeiEvaluation,
  ProjetEducatifIndividuelSummary,
  SchoolYear,
  UpdatePeiPayload,
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

interface BooleanResponse<T> {
  ok?: boolean;
  data: T;
}

interface RawGroup {
  id: number;
  nom: string;
  description?: string | null;
  annee_id: number;
  statut?: "actif" | "archive";
  nb_enfants?: number;
}

interface GroupChildrenResponse {
  ok?: boolean;
  data?: {
    items: RawGroupChild[];
    meta: { page: number; limit: number; total: number };
  };
}

interface RawGroupChild {
  enfant_id: number;
  prenom?: string | null;
  nom?: string | null;
  date_naissance?: string | null;
}

interface PeiListResponse {
  data: RawPeiDto[];
  page: number;
  pageSize: number;
  total: number;
}

interface RawPeiDto {
  id: number;
  enfant_id: number;
  educateur_id: number;
  annee_id: number;
  statut: "brouillon" | "actif" | "clos";
  date_creation: string;
  date_derniere_maj?: string;
  objectifs?: string | null;
  enfant?: { prenom?: string | null; nom?: string | null };
}

type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

interface EvaluationDto {
  id: number;
  date_evaluation: string;
  score?: number | null;
  notes?: string | null;
  educateur?: { prenom?: string | null; nom?: string | null };
}

interface ActivityDto {
  id: number;
  titre?: string | null;
  description?: string | null;
  objectifs?: string | null;
  type?: string | null;
  date_activite: string;
  educateur?: { prenom?: string | null; nom?: string | null };
}

interface DailyNoteDto {
  id: number;
  type?: string | null;
  contenu?: string | null;
  date_note: string;
  educateur?: { prenom?: string | null; nom?: string | null };
}

let cachedActiveYear: SchoolYear | null = null;

const getActiveSchoolYear = async (): Promise<SchoolYear> => {
  if (cachedActiveYear) {
    return cachedActiveYear;
  }
  const response = await api.get<BooleanResponse<SchoolYear | null>>("/annees-scolaires/active");
  const year = response.data?.data;
  if (!year) {
    throw new Error("Aucune année scolaire active n'a été trouvée");
  }
  cachedActiveYear = year;
  return year;
};

const ensureActiveYearId = async (anneeId?: number): Promise<number> => {
  if (anneeId) {
    return anneeId;
  }
  const year = await getActiveSchoolYear();
  return year.id;
};

const truncate = (value?: string | null, max = 120) => {
  if (!value) return undefined;
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
};

const formatUserName = (user?: { prenom?: string | null; nom?: string | null }) => {
  if (!user) return undefined;
  const parts = [user.prenom, user.nom].filter(Boolean);
  return parts.join(" ") || undefined;
};

const normalizePeiSummary = (
  pei: RawPeiDto,
  year?: SchoolYear,
): ProjetEducatifIndividuelSummary => {
  const statutMap: Record<string, ProjetEducatifIndividuelSummary["statut"]> = {
    actif: "ACTIF",
    clos: "CLOTURE",
    brouillon: "BROUILLON",
  };
  const titleSource = pei.enfant
    ? `PEI - ${pei.enfant.prenom ?? ""} ${pei.enfant.nom ?? ""}`.trim()
    : `PEI #${pei.id}`;
  return {
    id: pei.id,
    titre: titleSource || `PEI #${pei.id}`,
    statut: statutMap[pei.statut] ?? "BROUILLON",
    date_debut: pei.date_creation,
    objectifs_resume: truncate(pei.objectifs, 160),
    date_fin_prevue: year?.date_fin,
  };
};

export const getMyGroups = async (): Promise<Group[]> => {
  const activeYear = await getActiveSchoolYear();
  const response = await api.get<BooleanResponse<RawGroup[]>>("/groupes", {
    params: {
      anneeId: activeYear.id,
      page: 1,
      limit: 50,
    },
  });
  const rows = response.data?.data ?? [];
  return rows.map((group) => ({
    id: group.id,
    nom: group.nom,
    description: group.description ?? null,
    annee_id: group.annee_id,
    annee_scolaire: activeYear.libelle,
    statut: group.statut,
    nb_enfants: group.nb_enfants,
  }));
};

export const getChildrenByGroup = async (
  groupId: number,
  options?: { anneeId?: number; page?: number; limit?: number },
): Promise<ChildSummary[]> => {
  if (!groupId) {
    return [];
  }
  const anneeId = await ensureActiveYearId(options?.anneeId);
  const response = await api.get<GroupChildrenResponse>(`/groupes/${groupId}/inscriptions`, {
    params: {
      anneeId,
      page: options?.page ?? 1,
      limit: options?.limit ?? 50,
    },
  });
  const items = response.data?.data?.items ?? [];
  return items.map((item) => ({
    id: item.enfant_id,
    prenom: item.prenom ?? "",
    nom: item.nom ?? "",
    date_naissance: item.date_naissance ?? undefined,
  }));
};

export const getChildDetails = async (childId: number): Promise<ChildDetails> => {
  const response = await api.get<BooleanResponse<ChildDetails>>(`/enfants/${childId}`);
  return response.data.data;
};

export const getActivePeiForChild = async (
  childId: number,
): Promise<ProjetEducatifIndividuelSummary | null> => {
  const response = await api.get<PeiListResponse>("/pei", {
    params: {
      enfant_id: childId,
      statut: "actif",
      page: 1,
      pageSize: 1,
    },
  });
  const rows = response.data?.data ?? [];
  if (!rows.length) {
    return null;
  }
  return normalizePeiSummary(rows[0]);
};

export const createPEI = async (payload: CreatePeiPayload): Promise<PeiDetails> => {
  const response = await api.post<PeiDetails>("/pei", payload);
  return response.data;
};

export const getPEI = async (peiId: number): Promise<PeiDetails> => {
  const response = await api.get<PeiDetails>(`/pei/${peiId}`);
  return response.data;
};

export const updatePEI = async (
  peiId: number,
  payload: UpdatePeiPayload,
): Promise<PeiDetails> => {
  const response = await api.put<PeiDetails>(`/pei/${peiId}`, payload);
  return response.data;
};

export const addPEIActivity = async (
  peiId: number,
  payload: CreatePeiActivityPayload,
) => {
  const response = await api.post(`/pei/${peiId}/activites`, payload);
  return response.data;
};

export const addDailyNote = async (
  childId: number,
  payload: CreateDailyNotePayload,
) => {
  const { peiId, ...rest } = payload;
  const response = await api.post(`/pei/${peiId}/daily-notes`, {
    enfant_id: childId,
    ...rest,
  });
  return response.data;
};

export const getPeiEvaluations = async (
  peiId: number,
): Promise<PeiEvaluation[]> => {
  const response = await api.get<PaginatedResponse<EvaluationDto>>(
    `/pei/${peiId}/evaluations`,
    {
      params: { page: 1, pageSize: 20 },
    },
  );
  const rows = response.data?.data ?? [];
  return rows.map((evaluation) => ({
    id: evaluation.id,
    date: evaluation.date_evaluation,
    periode: evaluation.date_evaluation,
    commentaire_global: evaluation.notes ?? undefined,
    note_globale: evaluation.score ?? undefined,
    created_by: formatUserName(evaluation.educateur),
  }));
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
  const response = await api.post<BooleanResponse<ObservationInitialeDto>>(
    "/observation",
    payload,
  );
  return response.data.data;
};

export const updateObservationInitiale = async (
  observationId: number,
  payload: Partial<Omit<ObservationInitialePayload, "enfant_id">>,
): Promise<ObservationInitialeDto> => {
  const response = await api.put<BooleanResponse<ObservationInitialeDto>>(
    `/observation/${observationId}`,
    payload,
  );
  return response.data.data;
};

const mapActivityToHistory = (activity: ActivityDto): ChildHistoryEvent => ({
  id: `activity-${activity.id}`,
  type: "activity",
  date: activity.date_activite,
  title: activity.titre ?? "Activité",
  description: activity.description ?? undefined,
  meta: {
    type: activity.type,
    objectifs: activity.objectifs,
    educateur: formatUserName(activity.educateur),
  },
});

const mapEvaluationToHistory = (evaluation: EvaluationDto): ChildHistoryEvent => ({
  id: `evaluation-${evaluation.id}`,
  type: "evaluation",
  date: evaluation.date_evaluation,
  title: evaluation.score != null ? `Évaluation (${evaluation.score})` : "Évaluation",
  description: evaluation.notes ?? undefined,
  meta: {
    score: evaluation.score,
    educateur: formatUserName(evaluation.educateur),
  },
});

const mapDailyNoteToHistory = (note: DailyNoteDto): ChildHistoryEvent => ({
  id: `daily-note-${note.id}`,
  type: "daily_note",
  date: note.date_note,
  title: note.type ?? "Note quotidienne",
  description: note.contenu ?? undefined,
  meta: {
    educateur: formatUserName(note.educateur),
  },
});

const sortEvents = (events: ChildHistoryEvent[]) =>
  events.sort((a, b) => {
    const aTime = Date.parse(a.date);
    const bTime = Date.parse(b.date);
    return (isNaN(bTime) ? 0 : bTime) - (isNaN(aTime) ? 0 : aTime);
  });

export const getChildHistory = async (
  childId: number,
): Promise<ChildHistoryEvent[]> => {
  const activePei = await getActivePeiForChild(childId);
  if (!activePei) {
    return [];
  }
  const peiId = activePei.id;

  const [activitiesResp, evaluationsResp, notesResp] = await Promise.all([
    api.get<PaginatedResponse<ActivityDto>>(`/pei/${peiId}/activites`, {
      params: { page: 1, pageSize: 20 },
    }),
    api.get<PaginatedResponse<EvaluationDto>>(`/pei/${peiId}/evaluations`, {
      params: { page: 1, pageSize: 20 },
    }),
    api.get<PaginatedResponse<DailyNoteDto>>(`/pei/${peiId}/daily-notes`, {
      params: { page: 1, pageSize: 20 },
    }),
  ]);

  const events: ChildHistoryEvent[] = [
    ...((activitiesResp.data?.data ?? []).map(mapActivityToHistory)),
    ...((evaluationsResp.data?.data ?? []).map(mapEvaluationToHistory)),
    ...((notesResp.data?.data ?? []).map(mapDailyNoteToHistory)),
  ];

  return sortEvents(events);
};
