import { apiClient } from "@/lib/api/clients";
import { usersResponseSchema } from "@/lib/api/schemas";

export async function getUsers(params?: { limit?: number; search?: string }) {
  const queryParams = new URLSearchParams();

  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }

  if (params?.search) {
    queryParams.append("search", params.search);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/users?${queryString}` : "/users";

  return apiClient(url, {
    schema: usersResponseSchema,
  });
}
