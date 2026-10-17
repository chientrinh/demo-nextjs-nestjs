export let accessToken: string | null = null;
export function setAccessToken(token: string | null): void {
  accessToken = token;
}
export function clearAccessToken(): void {
  accessToken = null;
}