import { addDays, eachDayOfWeek, startOfWeek } from "@/shared/utils/time";

import type {
  AnalyticsSummary,
  TrendEvent,
  WeeklyTrend,
} from "../domain/types";

const POS_REVENUE = [
  1_320_000, 1_480_000, 1_610_000, 1_890_000, 2_340_000, 2_760_000, 2_530_000,
];

const EATCLUB_REVENUE = [
  180_000, 210_000, 260_000, 320_000, 410_000, 480_000, 320_000,
];

const LABOUR_COST = [
  180_000, 180_000, 220_000, 240_000, 260_000, 320_000, 300_000,
];

const COVERS = [112, 118, 124, 131, 145, 152, 123];

const EVENT_TEMPLATES: Omit<TrendEvent, "id" | "eventDate">[] = [
  {
    title: "Khuyến mãi giờ trưa",
    source: "EATCLUB",
    amount: -200_000,
    shift: "CA_TRUA",
  },
  {
    title: "Live nhạc cuối tuần",
    source: "POS",
    amount: 500_000,
    shift: "CA_TOI",
  },
];

export function buildWeeklyTrend(weekStartInput: string): WeeklyTrend {
  const weekStart = startOfWeek(weekStartInput);
  const dates = eachDayOfWeek(weekStart);

  const days = dates.map((date, index) => ({
    date,
    posRevenue: POS_REVENUE[index],
    eatclubRevenue: EATCLUB_REVENUE[index],
    labourCost: LABOUR_COST[index],
  }));

  const events = EVENT_TEMPLATES.map((template, index) => ({
    ...template,
    id: `evt-${weekStart}-${index}`,
    eventDate: dates[index === 0 ? 2 : 5],
  }));

  return { weekStart, days, events };
}

export function buildSummary(weekStartInput: string): AnalyticsSummary {
  const { weekStart, days } = buildWeeklyTrend(weekStartInput);
  const totalRevenue = days.reduce(
    (sum, day) => sum + day.posRevenue + day.eatclubRevenue,
    0,
  );

  return {
    from: weekStart,
    to: addDays(weekStart, 6),
    totalRevenue,
    averagePerDay: Math.round(totalRevenue / days.length),
    totalCovers: COVERS.reduce((sum, covers) => sum + covers, 0),
  };
}
