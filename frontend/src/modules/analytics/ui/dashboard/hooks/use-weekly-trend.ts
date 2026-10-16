import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../../application/services/analytics.service";

export function useWeeklyTrend(weekStart: string) {
  return useQuery({
    queryKey: ["analytics", "weekly-trend", weekStart],
    queryFn: () => analyticsService.weeklyTrend(weekStart),
    staleTime: 60_000,
  });
}
