import type { RevenueSource, WorkShift } from "@/modules/shared";

export type WeeklyTrendDay = {
  date: string;
  posRevenue: number;
  eatclubRevenue: number;
  labourCost: number;
};

export type TrendEvent = {
  id: string;
  title: string;
  source: RevenueSource;
  amount: number;
  eventDate: string;
  shift: WorkShift;
};

export type WeeklyTrend = {
  weekStart: string;
  days: WeeklyTrendDay[];
  events: TrendEvent[];
};

export type AnalyticsSummary = {
  from: string;
  to: string;
  totalRevenue: number;
  averagePerDay: number;
  totalCovers: number;
};
