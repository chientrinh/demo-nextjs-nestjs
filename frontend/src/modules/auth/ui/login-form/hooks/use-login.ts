"use client";

import { useCallback, useState } from "react";

import { authService } from "../../../application/services/auth.service";
import { useAuth } from "../../../application/store/session-provider";
import type { LoginInput } from "../../../domain/auth";

export function useLogin() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (input: LoginInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const session = await authService.login(input);
        login(session);
        return session;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Đăng nhập thất bại";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [login],
  );

  return { submit, isLoading, error };
}
