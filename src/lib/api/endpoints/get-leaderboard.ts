import { apiClient } from "@/lib/api/clients";
import { leaderboardResponseSchema } from "@/lib/api/schemas";

export async function getLeaderboard(params?: {
  period?: string;
  metric?: string;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();

  if (params?.period) {
    queryParams.append("period", params.period);
  }
  if (params?.metric) {
    queryParams.append("metric", params.metric);
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/runs/leaderboard?${queryString}` : "/runs/leaderboard";

  return apiClient(url, {
    schema: leaderboardResponseSchema,
  });
}
