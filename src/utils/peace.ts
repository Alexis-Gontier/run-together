import { format, addSeconds } from 'date-fns'

export function calculatePace(distanceKm: number, timeSeconds: number): string {
  if (distanceKm === 0) return "0:00"
  const paceSeconds = Math.round(timeSeconds / distanceKm)
  const date = addSeconds(new Date(0), paceSeconds)
  return format(date, 'm:ss')
}