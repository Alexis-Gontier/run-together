import { format } from 'date-fns';

export function formatDate(date: Date, dateFormat: string = 'PPP'): string {
  return format(date, dateFormat);
}