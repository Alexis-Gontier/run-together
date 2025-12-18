import { useQuery } from "@tanstack/react-query";
import { getRunDetail } from "@/lib/api/endpoints";

export function useRunDetail(runId: string | null | undefined) {
  return useQuery({
    queryKey: ["run-detail", runId],
    queryFn: () => {
      if (!runId) throw new Error("Run ID is required");
      return getRunDetail(runId);
    },
    enabled: !!runId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
