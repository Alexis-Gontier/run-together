import { apiClient } from "@/lib/api/clients";
import { recentRunsResponseSchema } from "@/lib/api/schemas";

export async function getRecentRuns(limit?: number) {
  const queryParams = new URLSearchParams();

  if (limit) {
    queryParams.append("limit", limit.toString());
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/runs/recent?${queryString}` : "/runs/recent";

  return apiClient(url, {
    schema: recentRunsResponseSchema,
  });
}
