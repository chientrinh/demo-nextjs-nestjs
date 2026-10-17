import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";

import type { AuthSession, AuthUser, LoginInput } from "../domain/auth";

import { setAccessToken, clearAccessToken } from "@/shared/token";

type UserDto = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
};

type AuthResponseDto = {
  accessToken: string;
  user: UserDto;
};

function mapUser(dto: UserDto): AuthUser {
  return {
    ...dto,
    role: dto.role as AuthUser["role"],
  };
}

function toSession(data: AuthResponseDto): AuthSession {
  return {
    accessToken: data.accessToken,
    user: mapUser(data.user),
  };
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const { data } = await httpClient.post<AuthResponseDto>(
    "/auth/login",
    input,
  );
  const session = toSession(data);
  setAccessToken(data.accessToken);
  return session;
}

export async function refresh(): Promise<AuthSession> {
  const { data } = await httpClient.post<AuthResponseDto>("/auth/refresh");
  const session = toSession(data);
  setAccessToken(data.accessToken);
  return session;
}

export async function logout(): Promise<void> {
  await httpClient.post("/auth/logout");
  clearAccessToken();
}
