"use client";

import type React from "react";
import { useEffect } from "react";
import { create } from "zustand";

import { storage } from "@/adapters/infrastructures/storage";
import type { AuthSession, AuthUser } from "../../domain/auth";
import { authService } from "../services/auth.service";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  hydrate: () => void;
  login: (session: AuthSession) => void;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

export const SESSION_STORAGE_KEY = "bistro_auth_session";

function readSession(): { user: AuthUser | null; token: string | null } {
  try {
    const raw = storage.get(SESSION_STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as AuthSession;
    return {
      user: parsed?.user ?? null,
      token: parsed?.accessToken ?? null,
    };
  } catch {
    return { user: null, token: null };
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  // Trạng thái khởi tạo cố định (null/"loading") để HTML server và client khớp
  // nhau; phiên đã lưu chỉ được nạp sau khi mount qua `hydrate`.
  user: null,
  status: "loading",
  isAuthenticated: false,
  hydrate: () => {
    const { user, token } = readSession();
    set({
      user,
      status: token ? "authenticated" : "unauthenticated",
      isAuthenticated: !!token,
    });
  },
  login: (s: AuthSession) => {
    storage.set(SESSION_STORAGE_KEY, JSON.stringify(s));
    set({
      user: s.user,
      status: "authenticated",
      isAuthenticated: true,
    });
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      storage.remove(SESSION_STORAGE_KEY);
      set({
        user: null,
        status: "unauthenticated",
        isAuthenticated: false,
      });
    }
  },
  setUser: (user) => {
    set({ user });
    if (user) {
      try {
        const raw = storage.get(SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          storage.set(SESSION_STORAGE_KEY, JSON.stringify({ ...parsed, user }));
        }
      } catch {
        /* ignore parsing error */
      }
    }
  },
}));

export const useAuth = () => useAuthStore();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <>{children}</>;
};
