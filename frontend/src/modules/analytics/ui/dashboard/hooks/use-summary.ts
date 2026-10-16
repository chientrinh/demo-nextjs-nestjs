import { useQuery } from "@tanstack/react-query";

import { analyticsService } from "../../../application/services/analytics.service";

export function useSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["analytics", "summary", from, to],
    queryFn: () => analyticsService.summary(from, to),
    staleTime: 60_000,
  });
}
