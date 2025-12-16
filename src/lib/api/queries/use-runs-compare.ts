import { useQuery } from "@tanstack/react-query";
import { getRunsCompare } from "@/lib/api/endpoints";

export function useRunsCompare(
  userIds: string[],
  options?: { startDate?: string | null; endDate?: string | null; enabled?: boolean }
) {
  const { startDate, endDate, enabled = true } = options || {};

  return useQuery({
    queryKey: ["runs-compare", ...userIds.sort(), startDate, endDate],
    queryFn: () =>
      getRunsCompare(userIds, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
    enabled: enabled && userIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
