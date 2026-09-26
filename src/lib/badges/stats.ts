export type RunForBadges = {
  date: Date
  distance: number // mètres
  duration: number // secondes
  elevation: number
}

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
  // Badges « pour rire »
  sixSevenRuns: number // 6,7 km (± 50 m) ou allure de 6'07"/km
  piRuns: number // 3,14 km (± 40 m)
  nightRuns: number // départ entre minuit et 4 h
  christmasRuns: number // un 25 décembre
  sundayRuns: number
  doubleDays: number // jours avec au moins deux courses
  fastRuns: number // < 4'00"/km sur 5 km ou plus
  slowRuns: number // > 8'00"/km
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
  weekday: "short",
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
    weekday: p.weekday,
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
  let sixSeven = 0
  let pi = 0
  let night = 0
  let christmas = 0
  let sunday = 0
  let fast = 0
  let slow = 0
  const perDay = new Map<string, number>()
  for (const r of runs) {
    const t = paris(r.date)
    const pace =
      r.distance > 0 ? Math.round((r.duration / r.distance) * 1000) : 0
    if (t.hour < 7) early++
    if (t.hour >= 21) late++
    if (t.hour < 4) night++
    if (t.month === 1 && t.day === 1) newYear++
    if (t.month === 12 && t.day === 25) christmas++
    if (t.weekday === "Sun") sunday++
    if (Math.abs(r.distance - 6700) <= 50 || pace === 367) sixSeven++
    if (Math.abs(r.distance - 3140) <= 40) pi++
    if (r.distance >= 5000 && pace > 0 && pace < 240) fast++
    if (pace > 480) slow++
    const day = `${t.year}-${t.month}-${t.day}`
    perDay.set(day, (perDay.get(day) ?? 0) + 1)
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
    sixSevenRuns: sixSeven,
    piRuns: pi,
    nightRuns: night,
    christmasRuns: christmas,
    sundayRuns: sunday,
    doubleDays: [...perDay.values()].filter((n) => n >= 2).length,
    fastRuns: fast,
    slowRuns: slow,
  }
}
