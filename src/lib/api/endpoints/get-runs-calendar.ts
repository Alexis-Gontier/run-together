import { apiClient } from '@/lib/api/clients';
import { runsCalendarResponseSchema } from '@/lib/api/schemas';

export async function getRunsCalendar(year?: number) {
  const currentYear = year || new Date().getFullYear();

  return apiClient(`/runs/calendar?year=${currentYear}`, {
    schema: runsCalendarResponseSchema,
  });
}
