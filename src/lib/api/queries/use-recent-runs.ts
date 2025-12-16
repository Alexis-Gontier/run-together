import { useQuery } from "@tanstack/react-query";
import { getRecentRuns } from "@/lib/api/endpoints";

export function useRecentRuns(limit?: number) {
  return useQuery({
    queryKey: ["recent-runs", limit],
    queryFn: () => getRecentRuns(limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
