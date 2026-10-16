export const ROUTES = {
  login: "/login",
  home: "/",
  eventNote: "/forms/event-note",
  labourCost: "/forms/labour-cost",
} as const;

export const PUBLIC_ROUTES: readonly string[] = [ROUTES.login];

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
