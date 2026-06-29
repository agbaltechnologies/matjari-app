'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { httpClient } from '@/src/core/http/http-client';
import { authApi } from '@/src/core/api/api';

interface AuthState {
  token: string | null;
  user: { id: string; email: string; firstName?: string; lastName?: string } | null;
  orgId: string | null;
  setAuth: (token: string, user: any, orgId?: string) => void;
  setOrgId: (id: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      orgId: null,
      setAuth: (token, user, orgId) => {
        httpClient.setToken(token);
        set({ token, user, orgId: orgId ?? null });
      },
      setOrgId: (id) => set({ orgId: id }),
      logout: () => {
        httpClient.clearToken();
        authApi.logout().catch(() => {});
        set({ token: null, user: null, orgId: null });
      },
    }),
    {
      name: 'matjari-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) httpClient.setToken(state.token);
      },
    },
  ),
);
