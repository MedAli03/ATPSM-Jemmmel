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
  const response = await api.get<Child[]>("/enfants/me/enfants");
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

export const getParentThreads = async (): Promise<MessageThread[]> => {
  const response = await api.get<{ data: { data: MessageThread[] } }>("/messages/threads");
  const payload = response.data?.data;
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
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
  return response.data.data ?? { data: [], nextCursor: null };
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
  const response = await api.get<{ data: { data: ParentNotification[] } }>("/notifications/me");
  const payload = response.data?.data;
  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }
  return [];
};
