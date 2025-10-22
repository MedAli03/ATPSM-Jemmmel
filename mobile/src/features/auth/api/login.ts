import { z } from 'zod';

import { api } from '@lib/axios';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string().optional()
});

export type LoginPayload = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const body = loginSchema.parse(payload);
  const { data } = await api.post('/mobile/auth/login', body);
  return loginResponseSchema.parse(data);
}
