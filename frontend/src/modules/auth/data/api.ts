import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";

import type { AuthSession, AuthUser, LoginInput } from "../domain/auth";

import { setAccessToken, clearAccessToken } from "@/shared/token";

type AuthResponseDto = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

function mapUser(dto: AuthResponseDto["user"]): AuthUser {
  return {
    ...dto,
    role: dto.role as AuthUser["role"],
  };
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const { data } = await httpClient.post<AuthResponseDto>(
    "/auth/login",
    input,
  );
  const session: AuthSession = {
    accessToken: data.accessToken,
    user: mapUser(data.user),
  };
  setAccessToken(data.accessToken);
  return session;
}

export async function refresh(): Promise<AuthSession> {
  const { data } = await httpClient.post<AuthResponseDto>("/auth/refresh");
  const session: AuthSession = {
    accessToken: data.accessToken,
    user: mapUser(data.user),
  };
  setAccessToken(data.accessToken);
  return session;
}

export async function logout(): Promise<void> {
  await httpClient.post("/auth/logout");
  clearAccessToken();
}
