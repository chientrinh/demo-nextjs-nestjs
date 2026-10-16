import type { AnalyticsSummary, WeeklyTrend } from "../domain/types";
import { buildSummary, buildWeeklyTrend } from "./mock";

const LATENCY_MS = 250;

function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => setTimeout(() => done(value), LATENCY_MS));
}

export async function fetchWeeklyTrend(weekStart: string): Promise<WeeklyTrend> {
  return resolve(buildWeeklyTrend(weekStart));
}

export async function fetchSummary(
  from: string,
  to: string,
): Promise<AnalyticsSummary> {
  void to;
  return resolve(buildSummary(from));
}
