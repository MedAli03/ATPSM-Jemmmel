import { z } from 'zod';

import { api } from '@lib/axios';

export const parentChildSchema = z.object({
  enfant: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    birthDate: z.string(),
    photoUrl: z.string().optional(),
    groupName: z.string().nullable()
  }),
  fiche: z.object({
    medicalNotes: z.string().nullable(),
    diagnosis: z.string().nullable(),
    supports: z.array(z.string()).optional()
  }),
  parents: z.object({
    guardians: z.array(
      z.object({
        name: z.string(),
        relation: z.string(),
        phone: z.string(),
        email: z.string().nullable()
      })
    )
  })
});

export type ParentChildPayload = z.infer<typeof parentChildSchema>;

export async function fetchParentChild(childId: number): Promise<ParentChildPayload> {
  const { data } = await api.get(`/mobile/parent/child/${childId}`);
  return parentChildSchema.parse(data);
}
