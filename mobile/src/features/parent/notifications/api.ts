import { z } from 'zod';

import { api } from '@lib/axios';

export const notificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  createdAt: z.string(),
  readAt: z.string().nullable()
});

export type NotificationDto = z.infer<typeof notificationSchema>;

export async function listParentNotifications(): Promise<NotificationDto[]> {
  const { data } = await api.get('/mobile/notifications', { params: { scope: 'parent' } });
  return z.array(notificationSchema).parse(data);
}

export async function markNotificationRead(notificationId: number): Promise<void> {
  await api.post(`/mobile/notifications/${notificationId}/read`);
}
