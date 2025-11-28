// src/features/parent/api.ts
import { api } from "../../services/api";
import {
  Child,
  MessageThread,
  ParentNotification,
  ThreadMessage,
  TimelineItem,
} from "./types";

type MessageCursor = { id: string; createdAt: string } | null;

export const getMyChildren = async (): Promise<Child[]> => {
  const response = await api.get<{ rows?: Child[]; data?: Child[] }>(
    "/enfants/me/enfants",
  );
  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  if (Array.isArray(response.data?.rows)) {
    return response.data.rows;
  }
  return [];
};

export const getChildById = async (childId: number): Promise<Child> => {
  const response = await api.get<{ ok?: boolean; data?: Child }>(`/enfants/${childId}`);
  if (response.data?.data) {
    return response.data.data;
  }
  return response.data as unknown as Child;
};

export const getChildTimeline = async (
  childId: number,
  options?: { anneeId?: number; limit?: number },
): Promise<TimelineItem[]> => {
  const params = {
    ...(options?.anneeId ? { anneeId: options.anneeId } : {}),
    ...(options?.limit ? { limit: options.limit } : {}),
  };
  const response = await api.get<{ ok?: boolean; data?: TimelineItem[] }>(
    `/enfants/${childId}/timeline`,
    { params: Object.keys(params).length ? params : undefined },
  );
  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  return [];
};

export const getParentThreads = async (): Promise<MessageThread[]> => {
  const response = await api.get<{ data: { data?: MessageThread[] } | MessageThread[] }>(
    "/messages/threads",
  );
  const payload = response.data?.data;
  if (payload && Array.isArray((payload as any).data)) {
    return (payload as { data: MessageThread[] }).data;
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  return [];
};

export const getThreadById = async (threadId: number): Promise<MessageThread> => {
  const response = await api.get<{ data: MessageThread }>(`/messages/threads/${threadId}`);
  return response.data.data;
};

export const getThreadMessages = async (
  threadId: number,
  cursor?: MessageCursor,
): Promise<{ data: ThreadMessage[]; nextCursor: MessageCursor }> => {
  const params = cursor ? { cursor: JSON.stringify(cursor) } : undefined;
  const response = await api.get<{ data: { data: ThreadMessage[]; nextCursor: MessageCursor } }>(
    `/messages/threads/${threadId}/messages`,
    { params },
  );
  const payload = response.data?.data;
  if (payload?.data) {
    return payload;
  }
  return { data: [], nextCursor: null };
};

export const sendThreadMessage = async (
  threadId: number,
  text: string,
): Promise<ThreadMessage> => {
  const response = await api.post<{ data: ThreadMessage }>(
    `/messages/threads/${threadId}/messages`,
    { text },
  );
  return response.data.data;
};

export const markThreadRead = async (
  threadId: number,
  upToMessageId?: number,
): Promise<void> => {
  await api.post(`/messages/threads/${threadId}/read`, {
    upToMessageId,
  });
};

export const getParentNotifications = async (): Promise<ParentNotification[]> => {
  const response = await api.get<{ ok?: boolean; data?: ParentNotification[] }>(
    "/notifications/me",
  );
  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }
  return [];
};
