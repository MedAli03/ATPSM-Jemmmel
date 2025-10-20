import { z } from 'zod';

import { api } from '@lib/axios';
const childSummarySchema = z.object({
  child: z.object({
    id: z.number(),
    name: z.string(),
    group: z.string().nullable()
  }),
  lastNote: z.string().nullable(),
  lastActivity: z.string().nullable()
});

export type ParentDashboardSummary = z.infer<typeof childSummarySchema>;

export async function fetchParentDashboard(): Promise<ParentDashboardSummary> {
  const { data } = await api.get('/mobile/parent/dashboard');
  return childSummarySchema.parse(data);
}
