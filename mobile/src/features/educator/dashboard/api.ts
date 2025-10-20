import { z } from 'zod';

import { api } from '@lib/axios';

export const educatorDashboardSchema = z.object({
  groupsCount: z.number(),
  childrenCount: z.number(),
  pendingItems: z.number()
});

export type EducatorDashboard = z.infer<typeof educatorDashboardSchema>;

export async function fetchEducatorDashboard(): Promise<EducatorDashboard> {
  const { data } = await api.get('/mobile/educator/dashboard');
  return educatorDashboardSchema.parse(data);
}
