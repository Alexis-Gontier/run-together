import { useQuery } from "@tanstack/react-query";
import { getRuns } from "@/lib/api/endpoints/get-runs";

export function useRuns(params?: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
  enabled?: boolean;
}) {
  const { limit = 10, offset = 0, sortBy = 'date', sortOrder = 'desc', enabled = true } = params || {};

  return useQuery({
    queryKey: ["runs", { limit, offset, sortBy, sortOrder }],
    queryFn: () => getRuns({ limit, offset, sortBy, sortOrder }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
}
