import { apiClient } from "@/lib/api/clients";
import { runsCompareResponseSchema } from "@/lib/api/schemas";

export async function getRunsCompare(
  userIds: string[],
  options?: { startDate?: string; endDate?: string }
) {
  if (!userIds || userIds.length === 0) {
    throw new Error("At least one user ID is required");
  }

  const params = new URLSearchParams();
  params.append("userIds", userIds.join(","));

  if (options?.startDate) {
    params.append("startDate", options.startDate);
  }
  if (options?.endDate) {
    params.append("endDate", options.endDate);
  }

  return apiClient(`/runs/compare?${params.toString()}`, {
    schema: runsCompareResponseSchema,
  });
}
