import { z } from 'zod';

import { api } from '@lib/axios';
import { CursorPage } from '@utils/pagination';

const threadSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  unreadCount: z.number(),
  updatedAt: z.string(),
  lastMessage: z
    .object({
      id: z.number(),
      text: z.string().nullable(),
      createdAt: z.string()
    })
    .nullable()
});

const messageSchema = z.object({
  id: z.number(),
  threadId: z.number(),
  senderId: z.number(),
  text: z.string().nullable(),
  createdAt: z.string(),
  status: z.enum(['sending', 'sent', 'failed', 'read']).optional()
});

export type EducatorThread = z.infer<typeof threadSchema>;
export type EducatorMessage = z.infer<typeof messageSchema>;

export async function listEducatorThreads(): Promise<EducatorThread[]> {
  const { data } = await api.get('/mobile/educator/threads');
  return z.array(threadSchema).parse(data);
}

export async function listEducatorMessages(
  threadId: number,
  cursor?: string
): Promise<CursorPage<EducatorMessage>> {
  const { data } = await api.get(`/mobile/educator/threads/${threadId}/messages`, {
    params: { cursor }
  });
  return z
    .object({ data: z.array(messageSchema), nextCursor: z.string().optional() })
    .parse(data);
}

export async function sendEducatorMessage(
  threadId: number,
  payload: { text: string; attachment?: { uri: string; name: string; mimeType: string } | null }
): Promise<EducatorMessage> {
  const formData = new FormData();
  formData.append('text', payload.text);
  if (payload.attachment) {
    formData.append('attachment', {
      uri: payload.attachment.uri,
      name: payload.attachment.name,
      type: payload.attachment.mimeType as any
    } as unknown as Blob);
  }
  const { data } = await api.post(`/mobile/educator/threads/${threadId}/messages`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return messageSchema.parse(data);
}

export async function markEducatorThreadRead(threadId: number, messageId?: number): Promise<void> {
  await api.post(`/mobile/educator/threads/${threadId}/read`, { messageId });
}
