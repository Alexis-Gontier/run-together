import { apiClient } from "@/lib/api/clients";
import { runsResponseSchema } from "@/lib/api/schemas/runs.schema";

export async function getRuns(params?: {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const searchParams = new URLSearchParams();

  if (params?.limit) searchParams.append("limit", params.limit.toString());
  if (params?.offset) searchParams.append("offset", params.offset.toString());
  if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  const url = `/runs${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  return apiClient(url, {
    schema: runsResponseSchema,
  });
}
