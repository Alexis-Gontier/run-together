export type RunForBadges = { date: Date; distance: number; elevation: number }

export type BadgeStats = {
  totalKm: number
  totalRuns: number
  totalElevation: number
  longestRunKm: number
  maxConsecutiveWeeks: number
  earlyRuns: number // départ avant 7 h (heure de Paris)
  lateRuns: number // départ à 21 h ou après
  newYearRuns: number // courses un 1er janvier
  recordDistances: number // distances sur lesquelles l'utilisateur détient un record
}

const DAY_MS = 24 * 60 * 60 * 1000

// Les heures « lève-tôt / noctambule » et le jour de l'an se lisent à l'heure de Paris, pas en UTC.
const parisParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
})

function paris(date: Date) {
  const p = Object.fromEntries(
    parisParts.formatToParts(date).map((x) => [x.type, x.value]),
  )
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
  }
}

/** Lundi (UTC minuit) de la semaine locale de la date, en millisecondes. */
function mondayOf(date: Date): number {
  const { year, month, day } = paris(date)
  const utc = Date.UTC(year, month - 1, day)
  const weekday = (new Date(utc).getUTCDay() + 6) % 7
  return utc - weekday * DAY_MS
}

/** Plus longue suite de semaines consécutives avec au moins une course. */
export function maxConsecutiveWeeks(dates: Date[]): number {
  const weeks = [...new Set(dates.map(mondayOf))].sort((a, b) => a - b)
  let best = weeks.length > 0 ? 1 : 0
  let run = best
  for (let i = 1; i < weeks.length; i++) {
    run = weeks[i] - weeks[i - 1] === 7 * DAY_MS ? run + 1 : 1
    best = Math.max(best, run)
  }
  return best
}

export function computeBadgeStats(
  runs: RunForBadges[],
  recordDistances: number,
): BadgeStats {
  let early = 0
  let late = 0
  let newYear = 0
  for (const r of runs) {
    const t = paris(r.date)
    if (t.hour < 7) early++
    if (t.hour >= 21) late++
    if (t.month === 1 && t.day === 1) newYear++
  }
  return {
    totalKm: runs.reduce((s, r) => s + r.distance, 0) / 1000,
    totalRuns: runs.length,
    totalElevation: runs.reduce((s, r) => s + r.elevation, 0),
    longestRunKm: runs.reduce((m, r) => Math.max(m, r.distance), 0) / 1000,
    maxConsecutiveWeeks: maxConsecutiveWeeks(runs.map((r) => r.date)),
    earlyRuns: early,
    lateRuns: late,
    newYearRuns: newYear,
    recordDistances,
  }
}
