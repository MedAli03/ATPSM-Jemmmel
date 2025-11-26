// src/features/educateur/api.ts
import axios from "axios";
import { api } from "../../services/api";
import {
  ChildDetails,
  ChildHistoryEvent,
  ChildSummary,
  CreateDailyNotePayload,
  CreatePeiActivityPayload,
  CreatePeiPayload,
  Group,
  MessageCursor,
  MessageThreadSummary,
  NewPeiEvaluationPayload,
  PeiActivitySummary,
  PeiDetails,
  PeiEvaluation,
  ProjetEducatifIndividuelSummary,
  SchoolYear,
  ThreadMessage,
  ThreadParticipantSummary,
  UpdatePeiPayload,
} from "./types";

export interface ObservationInitialeDto {
  id: number;
  enfant_id: number;
  educateur_id: number;
  date_observation: string;
  contenu: string;
  enfant?: { id: number; prenom?: string | null; nom?: string | null };
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
  statut:
    | "EN_ATTENTE_VALIDATION"
    | "VALIDE"
    | "CLOTURE"
    | "REFUSE"
    | "brouillon"
    | "actif"
    | "clos";
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

interface RawThreadParticipant {
  id: number;
  name?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  isCurrentUser?: boolean;
}

interface RawThreadMessage {
  id: number;
  threadId: number;
  kind?: string | null;
  text?: string | null;
  createdAt: string;
  sender?: { id: number; role?: string | null; name?: string | null } | null;
  readBy?: number[];
}

interface RawThreadSummary {
  id: number;
  title?: string | null;
  updatedAt?: string | null;
  unreadCount?: number;
  isGroup?: boolean;
  archived?: boolean;
  lastMessage?: RawThreadMessage | null;
  participants?: RawThreadParticipant[];
}

interface ThreadListResponse {
  data?: {
    data: RawThreadSummary[];
    page: number;
    limit: number;
    total: number;
  };
}

interface ThreadResponse {
  data?: RawThreadSummary;
}

interface ThreadMessagesResponse {
  data?: {
    data: RawThreadMessage[];
    nextCursor: MessageCursor | null;
  };
}

interface SendMessageResponse {
  data?: RawThreadMessage;
}

export class ForbiddenError extends Error {
  constructor(message?: string) {
    super(
      message ??
        "لا تملك صلاحية الوصول إلى هذه البيانات. الرجاء التواصل مع الإدارة."
    );
    this.name = "ForbiddenError";
  }
}

const throwIfForbidden = (error: unknown, fallbackMessage?: string) => {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    const responseData = error.response?.data as
      | { message?: string }
      | undefined;
    const backendMessage =
      typeof responseData?.message === "string"
        ? responseData.message
        : undefined;
    throw new ForbiddenError(
      backendMessage ?? fallbackMessage ?? "لا يمكنك الوصول إلى هذه البيانات."
    );
  }
};

let cachedActiveYear: SchoolYear | null = null;

export const getActiveSchoolYear = async (): Promise<SchoolYear> => {
  if (cachedActiveYear) {
    return cachedActiveYear;
  }
  const response = await api.get<BooleanResponse<SchoolYear | null>>(
    "/annees-scolaires/active"
  );
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

export const getAccessibleChildIds = async (): Promise<{
  enfantIds: number[];
  anneeId: number;
}> => {
  const response = await api.get<{ enfantIds?: number[]; anneeId: number }>(
    "/educateurs/me/enfants/ids"
  );
  return {
    enfantIds: response.data?.enfantIds ?? [],
    anneeId: response.data?.anneeId ?? (await getActiveSchoolYear()).id,
  };
};

const truncate = (value?: string | null, max = 120) => {
  if (!value) return undefined;
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
};

const formatUserName = (user?: {
  prenom?: string | null;
  nom?: string | null;
}) => {
  if (!user) return undefined;
  const parts = [user.prenom, user.nom].filter(Boolean);
  return parts.join(" ") || undefined;
};

const formatChildName = (child?: {
  prenom?: string | null;
  nom?: string | null;
}) => formatUserName(child) ?? `طفل #${child?.nom ?? "-"}`;

const mapThreadParticipant = (
  participant: RawThreadParticipant
): ThreadParticipantSummary => ({
  id: participant.id,
  name: participant.name ?? null,
  role: participant.role ?? null,
  avatarUrl: participant.avatarUrl ?? null,
  isCurrentUser: participant.isCurrentUser,
});

const mapThreadMessage = (message: RawThreadMessage): ThreadMessage => ({
  id: message.id,
  threadId: message.threadId,
  kind: message.kind,
  text: message.text,
  createdAt: message.createdAt,
  sender: message.sender
    ? {
        id: message.sender.id,
        name: message.sender.name,
        role: message.sender.role,
      }
    : null,
  readBy: message.readBy ?? [],
});

const mapThreadSummary = (thread: RawThreadSummary): MessageThreadSummary => ({
  id: thread.id,
  title: thread.title,
  updatedAt: thread.updatedAt,
  unreadCount: thread.unreadCount ?? 0,
  isGroup: thread.isGroup,
  archived: thread.archived,
  lastMessage: thread.lastMessage ? mapThreadMessage(thread.lastMessage) : null,
  participants: (thread.participants ?? []).map(mapThreadParticipant),
});

const normalizePeiSummary = (
  pei: RawPeiDto,
  year?: SchoolYear
): ProjetEducatifIndividuelSummary => {
  const statutMap: Record<string, ProjetEducatifIndividuelSummary["statut"]> = {
    actif: "VALIDE",
    VALIDE: "VALIDE",
    clos: "CLOTURE",
    CLOTURE: "CLOTURE",
    brouillon: "EN_ATTENTE_VALIDATION",
    EN_ATTENTE_VALIDATION: "EN_ATTENTE_VALIDATION",
    REFUSE: "REFUSE",
  };
  const titleSource = pei.enfant
    ? `PEI - ${pei.enfant.prenom ?? ""} ${pei.enfant.nom ?? ""}`.trim()
    : `PEI #${pei.id}`;
  return {
    id: pei.id,
    enfant_id: pei.enfant_id,
    enfant_nom_complet: formatChildName(pei.enfant),
    titre: titleSource || `PEI #${pei.id}`,
    statut: statutMap[pei.statut] ?? "EN_ATTENTE_VALIDATION",
    date_debut: pei.date_creation,
    objectifs_resume: truncate(pei.objectifs, 160),
    date_fin_prevue: year?.date_fin,
  };
};

const normalizePeiDetails = (pei: RawPeiDto): PeiDetails => ({
  ...normalizePeiSummary(pei),
  educateur_id: pei.educateur_id,
  annee_id: pei.annee_id,
  date_derniere_maj: pei.date_derniere_maj,
  objectifs: pei.objectifs ?? null,
});

export const getMyGroups = async (options?: {
  includeHistory?: boolean;
}): Promise<Group[]> => {
  try {
    const response = await api.get<BooleanResponse<RawGroup[]>>(
      "/educateurs/me/groupes"
    );
    const rows = response.data?.data ?? response.data ?? [];
    const activeYear = await getActiveSchoolYear();

    const mapGroup = (
      group: RawGroup,
      fallbackYear?: string | null
    ): Group => ({
      id: group.id,
      nom: group.nom,
      description: group.description ?? null,
      annee_id: group.annee_id,
      annee_scolaire: fallbackYear ?? activeYear.libelle,
      statut: group.statut,
      nb_enfants: group.nb_enfants,
    });

    const activeGroups = rows.map((group) => mapGroup(group));

    if (!options?.includeHistory) {
      return activeGroups;
    }

    return activeGroups;
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض المجموعات غير المسندة إليك.");
    throw error;
  }
};

export const getChildrenByGroup = async (
  groupId: number,
  options?: { anneeId?: number; page?: number; limit?: number }
): Promise<ChildSummary[]> => {
  if (!groupId) {
    return [];
  }
  try {
    const response = await api.get<GroupChildrenResponse>(
      "/educateurs/me/enfants",
      {
        params: {
          groupeId: groupId,
          page: options?.page ?? 1,
          limit: options?.limit ?? 50,
        },
      }
    );
    const items = response.data?.data ?? response.data?.data?.items ?? [];
    return items.map((item) => ({
      id: item.enfant_id,
      prenom: item.prenom ?? "",
      nom: item.nom ?? "",
      date_naissance: item.date_naissance ?? undefined,
    }));
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض أطفال مجموعة غير مسندة إليك.");
    throw error;
  }
};

export const getChildDetails = async (
  childId: number
): Promise<ChildDetails> => {
  try {
    const response = await api.get<BooleanResponse<ChildDetails>>(
      `/educateurs/enfants/${childId}`
    );
    return response.data.data ?? (response.data as unknown as ChildDetails);
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض ملف طفل خارج مجموعاتك.");
    throw error;
  }
};

export const getActivePeiForChild = async (
  childId: number
): Promise<ProjetEducatifIndividuelSummary | null> => {
  try {
    const response = await api.get<{ data?: RawPeiDto | null }>(
      `/educateurs/enfants/${childId}/pei-actif`
    );
    const pei = response.data?.data ?? (response.data as unknown as RawPeiDto);
    if (!pei) return null;
    return normalizePeiSummary(pei);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throwIfForbidden(error, "لا يمكنك الوصول إلى هذا الـ PEI.");
    throw error;
  }
};

export const getLatestPeiForChild = async (
  childId: number
): Promise<PeiDetails | null> => {
  try {
    const response = await api.get<PeiListResponse>("/pei", {
      params: { enfant_id: childId, page: 1, pageSize: 1 },
    });
    const rows = response.data?.data ?? [];
    if (!rows.length) {
      return null;
    }
    return normalizePeiDetails(rows[0]);
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك الوصول إلى هذا الـ PEI.");
    throw error;
  }
};

export const listEducatorPeiSummaries = async (
  educatorId: number,
  options?: { anneeId?: number; limit?: number }
): Promise<ProjetEducatifIndividuelSummary[]> => {
  try {
    const { enfantIds, anneeId } = await getAccessibleChildIds();
    const targetIds = enfantIds.slice(0, options?.limit ?? 20);
    const summaries = await Promise.all(
      targetIds.map((childId) => getActivePeiForChild(childId))
    );
    return summaries
      .filter((pei): pei is ProjetEducatifIndividuelSummary => Boolean(pei))
      .map((pei) => ({
        ...pei,
        date_fin_prevue: pei.date_fin_prevue ?? undefined,
        annee_id: options?.anneeId ?? anneeId,
      }));
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض PEI لمربّين آخرين.");
    throw error;
  }
};

export const createPEI = async (
  payload: CreatePeiPayload
): Promise<PeiDetails> => {
  const response = await api.post<{ data?: RawPeiDto }>(
    `/educateurs/enfants/${payload.enfant_id}/pei`,
    payload
  );
  const pei = response.data.data ?? (response.data as unknown as RawPeiDto);
  return normalizePeiDetails(pei);
};

export const getPEI = async (peiId?: number | null): Promise<PeiDetails> => {
  if (!peiId || !Number.isFinite(peiId)) {
    throw new Error("معرّف الـ PEI غير صالح");
  }
  try {
    const response = await api.get<RawPeiDto>(`/pei/${peiId}`);
    return normalizePeiDetails(response.data);
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض هذا المشروع التربوي.");
    throw error;
  }
};

export const updatePEI = async (
  peiId: number,
  payload: UpdatePeiPayload
): Promise<PeiDetails> => {
  const response = await api.put<{ data?: PeiDetails }>(
    `/educateurs/pei/${peiId}`,
    payload
  );
  return response.data.data ?? (response.data as unknown as PeiDetails);
};

export const addPEIActivity = async (
  peiId: number,
  payload: CreatePeiActivityPayload
) => {
  const response = await api.post(`/educateurs/pei/${peiId}/activites`, payload);
  return response.data?.data ?? response.data;
};

export const addDailyNote = async (
  childId: number,
  payload: CreateDailyNotePayload
) => {
  const { peiId, ...rest } = payload;
  const response = await api.post(`/educateurs/enfants/${childId}/daily-notes`, {
    enfant_id: childId,
    peiId,
    ...rest,
  });
  return response.data?.data ?? response.data;
};

export const getPeiEvaluations = async (
  peiId: number
): Promise<PeiEvaluation[]> => {
  try {
    const response = await api.get<PaginatedResponse<EvaluationDto>>(
      `/educateurs/pei/${peiId}/evaluations`,
      {
        params: { page: 1, pageSize: 20 },
      }
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
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك الاطّلاع على تقييمات هذا الـ PEI.");
    throw error;
  }
};

export const getPeiActivities = async (
  peiId: number,
  options?: { page?: number; pageSize?: number }
): Promise<PeiActivitySummary[]> => {
  try {
    const response = await api.get<PaginatedResponse<ActivityDto>>(
      `/educateurs/pei/${peiId}/activites`,
      {
        params: {
          page: options?.page ?? 1,
          pageSize: options?.pageSize ?? 20,
        },
      }
    );
    const rows = response.data?.data ?? [];
    return rows.map((activity) => ({
      id: activity.id,
      date: activity.date_activite,
      titre: activity.titre,
      description: activity.description,
      objectifs: activity.objectifs,
      type: activity.type,
      educateur: formatUserName(activity.educateur),
    }));
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض أنشطة هذا الـ PEI.");
    throw error;
  }
};

export const createPeiEvaluation = async (
  peiId: number,
  payload: NewPeiEvaluationPayload
): Promise<PeiEvaluation> => {
  const response = await api.post<PeiEvaluation>(
    `/educateurs/pei/${peiId}/evaluations`,
    payload
  );
  return response.data?.data ?? response.data;
};

export const getLatestObservationInitiale = async (
  enfantId: number
): Promise<ObservationInitialeDto | null> => {
  const response = await api.get<ObservationListResponse>(
    `/educateurs/enfants/${enfantId}/observations-initiales`,
    {
      params: {
        limit: 1,
        page: 1,
      },
    }
  );

  const rows = response.data?.rows ?? response.data?.data ?? [];
  return rows.length > 0 ? (rows as ObservationInitialeDto[])[0] : null;
};

export const listRecentObservations = async (filters: {
  educateurId?: number;
  enfantId?: number;
  limit?: number;
}): Promise<ObservationInitialeDto[]> => {
  const targetChildIds = filters.enfantId
    ? [filters.enfantId]
    : (await getAccessibleChildIds()).enfantIds;
  if (!targetChildIds.length) return [];

  const perChildLimit = 1;
  const results = await Promise.all(
    targetChildIds.map((childId) =>
      api
        .get<ObservationListResponse>(
          `/educateurs/enfants/${childId}/observations-initiales`,
          {
            params: {
              limit: perChildLimit,
              page: 1,
            },
          }
        )
        .then((response) => response.data?.rows ?? response.data?.data ?? [])
        .catch((error) => {
          throwIfForbidden(error);
          return [];
        })
    )
  );

  return results
    .flat()
    .filter(Boolean)
    .sort((a, b) => {
      const aDate = Date.parse(a.date_observation ?? "");
      const bDate = Date.parse(b.date_observation ?? "");
      return (isNaN(bDate) ? 0 : bDate) - (isNaN(aDate) ? 0 : aDate);
    })
    .slice(0, filters.limit ?? 5) as ObservationInitialeDto[];
};

export const createObservationInitiale = async (
  payload: ObservationInitialePayload
): Promise<ObservationInitialeDto> => {
  const response = await api.post<BooleanResponse<ObservationInitialeDto>>(
    `/educateurs/enfants/${payload.enfant_id}/observations-initiales`,
    payload
  );
  return response.data.data ?? (response.data as unknown as ObservationInitialeDto);
};

export const updateObservationInitiale = async (
  observationId: number,
  payload: Partial<Omit<ObservationInitialePayload, "enfant_id">>
): Promise<ObservationInitialeDto> => {
  const response = await api.put<BooleanResponse<ObservationInitialeDto>>(
    `/educateurs/observations-initiales/${observationId}`,
    payload
  );
  return response.data.data ?? (response.data as unknown as ObservationInitialeDto);
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

const mapEvaluationToHistory = (
  evaluation: EvaluationDto
): ChildHistoryEvent => ({
  id: `evaluation-${evaluation.id}`,
  type: "evaluation",
  date: evaluation.date_evaluation,
  title:
    evaluation.score != null
      ? `Évaluation (${evaluation.score})`
      : "Évaluation",
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
  options?: { peiId?: number }
): Promise<ChildHistoryEvent[]> => {
  try {
    const activePei = options?.peiId
      ? { id: options.peiId }
      : await getActivePeiForChild(childId);
    if (!activePei) {
      return [];
    }
    const peiId = options?.peiId ?? activePei.id;

    const [activitiesResp, evaluationsResp, notesResp] = await Promise.all([
      api.get<PaginatedResponse<ActivityDto>>(
        `/educateurs/pei/${peiId}/activites`,
        {
          params: { page: 1, pageSize: 20 },
        }
      ),
      api.get<PaginatedResponse<EvaluationDto>>(
        `/educateurs/pei/${peiId}/evaluations`,
        {
          params: { page: 1, pageSize: 20 },
        }
      ),
      api.get<PaginatedResponse<DailyNoteDto>>(
        `/educateurs/enfants/${childId}/daily-notes`,
        {
          params: { page: 1, pageSize: 20 },
        }
      ),
    ]);

    const events: ChildHistoryEvent[] = [
      ...(activitiesResp.data?.data ?? []).map(mapActivityToHistory),
      ...(evaluationsResp.data?.data ?? []).map(mapEvaluationToHistory),
      ...(notesResp.data?.data ?? []).map(mapDailyNoteToHistory),
    ];

    return sortEvents(events);
  } catch (error) {
    throwIfForbidden(error, "لا يمكنك عرض سجلّ هذا الطفل.");
    throw error;
  }
};

export const listMessageThreads = async (options?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get<ThreadListResponse>("/messages/threads", {
    params: {
      page: options?.page,
      limit: options?.limit,
      status: options?.status,
    },
  });
  const payload = response.data?.data;
  return {
    threads: (payload?.data ?? []).map(mapThreadSummary),
    page: payload?.page ?? 1,
    limit: payload?.limit ?? options?.limit ?? 20,
    total: payload?.total ?? 0,
  };
};

export const getThreadDetails = async (
  threadId: number
): Promise<MessageThreadSummary> => {
  const response = await api.get<ThreadResponse>(
    `/messages/threads/${threadId}`
  );
  const thread = response.data?.data;
  if (!thread) {
    throw new Error("المحادثة غير متاحة حاليًا");
  }
  return mapThreadSummary(thread);
};

export const listThreadMessages = async (
  threadId: number,
  options?: { limit?: number; cursor?: MessageCursor | null }
): Promise<{ messages: ThreadMessage[]; nextCursor: MessageCursor | null }> => {
  const response = await api.get<ThreadMessagesResponse>(
    `/messages/threads/${threadId}/messages`,
    {
      params: {
        limit: options?.limit,
        cursor: options?.cursor ? JSON.stringify(options.cursor) : undefined,
      },
    }
  );
  const payload = response.data?.data;
  return {
    messages: (payload?.data ?? []).map(mapThreadMessage),
    nextCursor: payload?.nextCursor ?? null,
  };
};

export const sendThreadMessage = async (
  threadId: number,
  payload: { text: string; attachments?: unknown[] }
): Promise<ThreadMessage> => {
  const response = await api.post<SendMessageResponse>(
    `/messages/threads/${threadId}/messages`,
    payload
  );
  const message = response.data?.data;
  if (!message) {
    throw new Error("تعذّر إرسال الرسالة");
  }
  return mapThreadMessage(message);
};

export const markThreadAsRead = async (
  threadId: number,
  upToMessageId?: number | null
) => {
  await api.post(`/messages/threads/${threadId}/read`, {
    upToMessageId: upToMessageId ?? undefined,
  });
};
