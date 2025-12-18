import { apiClient } from "@/lib/api/clients";
import { userCalendarResponseSchema } from "@/lib/api/schemas/user-calendar.schema";

export async function getUserCalendar(userId: string, year?: number) {
  const queryParams = year ? `?year=${year}` : "";
  return apiClient(`/users/${userId}/calendar${queryParams}`, {
    schema: userCalendarResponseSchema,
  });
}
