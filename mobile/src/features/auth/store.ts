import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import jwtDecode from 'jwt-decode';

import { loadSession, saveToken, saveRole, clearSession } from '@lib/storage';

export type Role = 'PARENT' | 'EDUCATEUR';

export interface SessionUser {
  id: number;
  email: string;
  role: Role;
  name?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, refreshToken: string | null) => Promise<void>;
  logout: () => Promise<void>;
}

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  name?: string;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    immer(
      persist(
        (set, get) => ({
          token: null,
          refreshToken: null,
          user: null,
          hydrated: false,
          hydrate: async () => {
            if (get().hydrated) return;
            const session = await loadSession();
            if (session.token) {
              try {
                const decoded = jwtDecode<JwtPayload>(session.token);
                const role = decoded.role;
                if (role !== 'PARENT' && role !== 'EDUCATEUR') {
                  await get().logout();
                  set((state) => {
                    state.hydrated = true;
                  });
                  return;
                }
                set((state) => {
                  state.token = session.token;
                  state.refreshToken = session.refreshToken;
                  state.user = {
                    id: Number(decoded.sub),
                    email: decoded.email,
                    role,
                    name: decoded.name
                  };
                  state.hydrated = true;
                });
              } catch (error) {
                console.warn('Failed to decode stored token', error);
                await get().logout();
                set((state) => {
                  state.hydrated = true;
                });
              }
            } else {
              set((state) => {
                state.hydrated = true;
              });
            }
          },
          setSession: async (token: string, refreshToken: string | null) => {
            const decoded = jwtDecode<JwtPayload>(token);
            if (decoded.role !== 'PARENT' && decoded.role !== 'EDUCATEUR') {
              throw new Error('Unsupported role');
            }
            await saveToken(token, refreshToken ?? undefined);
            await saveRole(decoded.role);
            set((state) => {
              state.token = token;
              state.refreshToken = refreshToken;
              state.user = {
                id: Number(decoded.sub),
                email: decoded.email,
                role: decoded.role,
                name: decoded.name
              };
            });
          },
          logout: async () => {
            await clearSession();
            set((state) => {
              state.token = null;
              state.refreshToken = null;
              state.user = null;
            });
          }
        }),
        {
          name: 'auth-store',
          storage: createJSONStorage(() => ({
            getItem: async () => null,
            setItem: async () => {},
            removeItem: async () => {}
          }))
        }
      )
    )
  )
);
