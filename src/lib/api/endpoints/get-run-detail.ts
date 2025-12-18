import { apiClient } from "@/lib/api/clients";
import { runDetailResponseSchema } from "@/lib/api/schemas/run-detail.schema";

export async function getRunDetail(runId: string) {
  return apiClient(`/runs/${runId}`, {
    schema: runDetailResponseSchema,
  });
}
