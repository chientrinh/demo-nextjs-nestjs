"use client";

import type React from "react";
import { useEffect } from "react";
import { create } from "zustand";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isTokenExpired,
} from "@/shared/token";
import type { AuthSession, AuthUser } from "../../domain/auth";
import { authService } from "../services/auth.service";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  restore: () => Promise<void>;
  login: (session: AuthSession) => void;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

// Cờ module-level chống restore chạy hai lần (React StrictMode dev).
let isRestoring = false;

export const useAuthStore = create<AuthState>()((set) => ({
  // Trạng thái khởi tạo cố định (null/"loading") để HTML server và client khớp nhau;
  // phiên chỉ được khôi phục sau khi mount qua `restore`.
  user: null,
  status: "loading",
  isAuthenticated: false,
  restore: async () => {
    if (isRestoring) return;
    isRestoring = true;
    try {
      const token = getAccessToken();
      if (token && !isTokenExpired(token)) {
        set({ status: "authenticated", isAuthenticated: true });
        return;
      }
      const session = await authService.refresh();
      set({
        user: session.user,
        status: "authenticated",
        isAuthenticated: true,
      });
    } catch {
      clearAccessToken();
      set({ user: null, status: "unauthenticated", isAuthenticated: false });
    } finally {
      isRestoring = false;
    }
  },
  login: (s: AuthSession) => {
    setAccessToken(s.accessToken);
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
      clearAccessToken();
      set({
        user: null,
        status: "unauthenticated",
        isAuthenticated: false,
      });
    }
  },
  setUser: (user) => {
    set({ user });
  },
}));

export const useAuth = () => useAuthStore();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    void useAuthStore.getState().restore();
  }, []);

  return <>{children}</>;
};
