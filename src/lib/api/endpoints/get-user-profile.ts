import { apiClient } from "@/lib/api/clients";
import { userProfileResponseSchema } from "@/lib/api/schemas/user-profile.schema";

export async function getUserProfile(userId: string) {
  return apiClient(`/users/${userId}`, {
    schema: userProfileResponseSchema,
  });
}
