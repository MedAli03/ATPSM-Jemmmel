import { z } from 'zod';

import { api } from '@lib/axios';

const educatorChildSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  groupName: z.string().nullable()
});

export type EducatorChild = z.infer<typeof educatorChildSchema>;

export async function listEducatorChildren(): Promise<EducatorChild[]> {
  const { data } = await api.get('/mobile/educator/children');
  return z.array(educatorChildSchema).parse(data);
}
