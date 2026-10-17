import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";
import { storage } from "@/adapters/infrastructures/storage";

import type { AuthSession, AuthUser, LoginInput } from "../domain/auth";

const SESSION_STORAGE_KEY = "bistro_auth_session";

type AuthResponseDto = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
};

function mapUser(dto: AuthResponseDto["user"]): AuthUser {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.fullName,
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
  storage.set(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function refresh(): Promise<AuthSession> {
  const { data } = await httpClient.post<AuthResponseDto>("/auth/refresh");
  const session: AuthSession = {
    accessToken: data.accessToken,
    user: mapUser(data.user),
  };
  storage.set(SESSION_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function logout(): Promise<void> {
  await httpClient.post("/auth/logout");
}
