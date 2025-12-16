import {
  format,
  getYear
} from 'date-fns';
import { fr } from "date-fns/locale"

export function formatDate(date: Date | string, dateFormat: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, dateFormat, { locale: fr });
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: fr });
}

export function getCurrentYear(): number {
  return getYear(new Date());
}