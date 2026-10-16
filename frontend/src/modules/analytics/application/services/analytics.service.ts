import { fetchSummary, fetchWeeklyTrend } from "../../data/api";
import type { AnalyticsSummary, WeeklyTrend } from "../../domain/types";

export const analyticsService = {
  weeklyTrend: (weekStart: string): Promise<WeeklyTrend> =>
    fetchWeeklyTrend(weekStart),
  summary: (from: string, to: string): Promise<AnalyticsSummary> =>
    fetchSummary(from, to),
};
