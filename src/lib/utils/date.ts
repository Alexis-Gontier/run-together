import {
  format,
  getYear
} from 'date-fns';
import { fr } from "date-fns/locale"

export function formatDate(date: Date, dateFormat: string = 'PPP'): string {
  return format(date, dateFormat, { locale: fr });
}

export function formatDateShort(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: fr });
}

export function getCurrentYear(): number {
  return getYear(new Date());
}