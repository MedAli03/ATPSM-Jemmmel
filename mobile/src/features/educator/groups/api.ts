import { z } from 'zod';

import { api } from '@lib/axios';

const groupSchema = z.object({
  id: z.number(),
  name: z.string(),
  childCount: z.number()
});

const groupDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  children: z.array(
    z.object({
      id: z.number(),
      firstName: z.string(),
      lastName: z.string()
    })
  )
});

export type GroupSummary = z.infer<typeof groupSchema>;
export type GroupDetail = z.infer<typeof groupDetailSchema>;

export async function listEducatorGroups(): Promise<GroupSummary[]> {
  const { data } = await api.get('/mobile/educator/groups');
  return z.array(groupSchema).parse(data);
}

export async function fetchEducatorGroupDetail(groupId: number): Promise<GroupDetail> {
  const { data } = await api.get(`/mobile/educator/groups/${groupId}`);
  return groupDetailSchema.parse(data);
}
