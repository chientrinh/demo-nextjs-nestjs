import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";

import type { WeeklyTrend, AnalyticsSummary } from "../domain/types";

export async function fetchWeeklyTrend(weekStart: string): Promise<WeeklyTrend> {
  const { data } = await httpClient.get<WeeklyTrend>("/analytics/weekly-trend", {
    params: { weekStart },
  });
  return data;
}

export async function fetchSummary(
  from: string,
  to: string,
): Promise<AnalyticsSummary> {
  const { data } = await httpClient.get<Omit<AnalyticsSummary, "from" | "to"> & { daysWithData: number }>(
    "/analytics/summary",
    { params: { from, to } },
  );
  // Backend không trả from/to trong response → bổ sung từ params
  return {
    from,
    to,
    totalRevenue: data.totalRevenue,
    averagePerDay: data.averagePerDay,
    totalCovers: data.totalCovers,
  };
}
