import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/lib/api/endpoints";

export function useLeaderboard(params?: {
  period?: string;
  metric?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["leaderboard", params?.period, params?.metric, params?.limit],
    queryFn: () => getLeaderboard(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
