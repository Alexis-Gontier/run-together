import { differenceInCalendarYears, differenceInHours, format } from "date-fns"
import { fr } from "date-fns/locale"

export function formatRunDistance(meters: number): string {
  return (meters / 1000).toFixed(2)
}

export function formatRunPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60)
  const sec = secondsPerKm % 60
  return `${min}'${String(sec).padStart(2, "0")}"`
}

export function formatRunDurationDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0)
    return `${h}h${String(m).padStart(2, "0")}'${String(s).padStart(2, "0")}"`
  return `${m}'${String(s).padStart(2, "0")}"`
}

export function formatRunDateShort(date: Date): string {
  const now = new Date()
  if (differenceInHours(now, date) < 24) return format(date, "HH:mm")
  if (differenceInCalendarYears(now, date) < 1)
    return format(date, "d MMM", { locale: fr })
  return format(date, "d MMM yyyy", { locale: fr })
}

export function formatPace(secondsPerKm: number): string {
  const min = Math.floor(secondsPerKm / 60)
  const sec = secondsPerKm % 60
  return `${min}:${String(sec).padStart(2, "0")}`
}

export function formatRunDuration(totalSeconds: number): string {
  return formatDuration(totalSeconds)
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }
  return `${m}:${String(s).padStart(2, "0")}`
}

export function formatRunDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// Receives km, returns formatted string with 2 decimal places
export function formatDistanceShort(km: number): string {
  return km.toFixed(2)
}
