import { z } from 'zod';

import { api } from '@lib/axios';
import { CursorPage } from '@utils/pagination';

export const threadSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  childId: z.number().nullable(),
  unreadCount: z.number(),
  lastMessage: z
    .object({
      id: z.number(),
      text: z.string().nullable(),
      createdAt: z.string()
    })
    .nullable(),
  updatedAt: z.string()
});

export const messageSchema = z.object({
  id: z.number(),
  threadId: z.number(),
  senderId: z.number(),
  text: z.string().nullable(),
  createdAt: z.string(),
  status: z.enum(['sending', 'sent', 'failed', 'read']).optional(),
  readBy: z.array(z.number()).optional()
});

export type ThreadDto = z.infer<typeof threadSchema>;
export type MessageDto = z.infer<typeof messageSchema>;

export async function listParentThreads(childId?: number): Promise<ThreadDto[]> {
  const { data } = await api.get('/mobile/parent/threads', { params: { childId } });
  return z.array(threadSchema).parse(data);
}

export async function listParentMessages(
  threadId: number,
  cursor?: string
): Promise<CursorPage<MessageDto>> {
  const { data } = await api.get(`/mobile/parent/threads/${threadId}/messages`, {
    params: { cursor }
  });
  return z
    .object({
      data: z.array(messageSchema),
      nextCursor: z.string().optional()
    })
    .parse(data);
}

export async function sendParentMessage(
  threadId: number,
  payload: { text: string; attachment?: { uri: string; name: string; mimeType: string } | null }
): Promise<MessageDto> {
  const formData = new FormData();
  formData.append('text', payload.text);
  if (payload.attachment) {
    formData.append('attachment', {
      uri: payload.attachment.uri,
      name: payload.attachment.name,
      type: payload.attachment.mimeType as any
    } as unknown as Blob);
  }
  const { data } = await api.post(`/mobile/parent/threads/${threadId}/messages`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return messageSchema.parse(data);
}

export async function markParentThreadRead(threadId: number, messageId?: number): Promise<void> {
  await api.post(`/mobile/parent/threads/${threadId}/read`, { messageId });
}
