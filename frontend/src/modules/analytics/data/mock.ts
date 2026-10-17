import { addDays, eachDayOfWeek, startOfWeek } from "@/shared/utils/time";

import type {
  AnalyticsSummary,
  TrendEvent,
  WeeklyTrend,
} from "../domain/types";

const POS_REVENUE = [1320, 1480, 1610, 1890, 2340, 2760, 2530];

const EATCLUB_REVENUE = [180, 210, 260, 320, 410, 480, 320];

const LABOUR_COST = [500, 540, 640, 720, 880, 1040, 950];

const COVERS = [112, 118, 124, 131, 145, 152, 123];

const EVENT_TEMPLATES: Omit<TrendEvent, "id" | "eventDate">[] = [
  {
    title: "Khuyến mãi giờ trưa",
    source: "EATCLUB",
    amount: -200,
    shift: "CA_TRUA",
  },
  {
    title: "Live nhạc cuối tuần",
    source: "POS",
    amount: 500,
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
