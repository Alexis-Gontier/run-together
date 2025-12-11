import { useQuery } from '@tanstack/react-query';
import { getRunsCalendar } from '@/lib/api/endpoints';

export function useRunsCalendar(year?: number) {
  const currentYear = year || new Date().getFullYear();

  return useQuery({
    queryKey: ['runs-calendar', currentYear],
    queryFn: () => getRunsCalendar(currentYear),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
