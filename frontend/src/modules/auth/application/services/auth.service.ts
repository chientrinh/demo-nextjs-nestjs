import * as authApi from "../../data/api";
import type { LoginInput, AuthSession } from "../../domain/auth";

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    return authApi.login(input);
  },

  async refresh(): Promise<AuthSession> {
    return authApi.refresh();
  },

  async logout(): Promise<void> {
    return authApi.logout();
  },
};
