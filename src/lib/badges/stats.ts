export type RunForBadges = {
  date: Date
  distance: number // mètres
  duration: number // secondes
  elevation: number
}

/** Données qui ne se déduisent pas des seules courses de l'utilisateur. */
export type BadgeContext = {
  recordDistances: number // distances sur lesquelles l'utilisateur détient un record
  maxRecordsOnOneRun: number // plus grand nombre de records détenus grâce à une même course
  groupKm: number // distance cumulée de tout le groupe
  groupElevation: number // D+ cumulé de tout le groupe
}

export type BadgeStats = BadgeContext & {
  totalKm: number
  totalRuns: number
  totalElevation: number
  longestRunKm: number
  maxConsecutiveWeeks: number
  maxWeekKm: number
  maxMonthKm: number
  earlyRuns: number // départ avant 7 h (heure de Paris)
  lateRuns: number // départ à 21 h ou après
  newYearRuns: number // 1er janvier
  // Badges « pour rire »
  sixSevenRuns: number // 6,7 km (± 50 m) ou allure de 6'07"/km
  piRuns: number // 3,14 km (± 40 m)
  nightRuns: number // départ entre minuit et 4 h
  christmasRuns: number // 25 décembre
  friday13Runs: number
  aprilFoolRuns: number // 1er avril
  halloweenRuns: number // 31 octobre
  newYearEveRuns: number // 31 décembre
  sundayRuns: number
  doubleDays: number // jours avec au moins deux courses
  fastRuns: number // < 4'00"/km sur 5 km ou plus
  slowRuns: number // > 8'00"/km
  onTheHourRuns: number // départ à XX:00 pile
  roundKmRuns: number // distance au kilomètre rond (± 10 m), 3 km ou plus
  palindromeRuns: number // chrono qui se lit dans les deux sens (4 chiffres ou plus)
  samePaceRuns: number // courses de 3 km ou plus partageant leur allure avec une autre
}

export const EMPTY_CONTEXT: BadgeContext = {
  recordDistances: 0,
  maxRecordsOnOneRun: 0,
  groupKm: 0,
  groupElevation: 0,
}

const DAY_MS = 24 * 60 * 60 * 1000

// Heures, jours et semaines se lisent à l'heure de Paris, pas en UTC.
const parisParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
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
    minute: Number(p.minute),
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

/** Chrono affiché (« 45:54 », « 1:02:01 ») qui se lit dans les deux sens, sur 4 chiffres ou plus. */
export function isPalindromeDuration(seconds: number): boolean {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, "0")
  const digits = h > 0 ? `${h}${pad(m)}${pad(s)}` : `${m}${pad(s)}`
  return digits.length >= 4 && digits === [...digits].reverse().join("")
}

const maxOf = (values: Iterable<number>) => Math.max(0, ...values)

export function computeBadgeStats(
  runs: RunForBadges[],
  context: BadgeContext,
): BadgeStats {
  const c = {
    early: 0,
    late: 0,
    newYear: 0,
    sixSeven: 0,
    pi: 0,
    night: 0,
    christmas: 0,
    friday13: 0,
    aprilFool: 0,
    halloween: 0,
    newYearEve: 0,
    sunday: 0,
    fast: 0,
    slow: 0,
    onTheHour: 0,
    roundKm: 0,
    palindrome: 0,
  }
  const perDay = new Map<string, number>()
  const perWeek = new Map<number, number>()
  const perMonth = new Map<string, number>()
  const paces = new Map<number, number>()

  for (const r of runs) {
    const t = paris(r.date)
    const pace =
      r.distance > 0 ? Math.round((r.duration / r.distance) * 1000) : 0
    if (t.hour < 7) c.early++
    if (t.hour >= 21) c.late++
    if (t.hour < 4) c.night++
    if (t.minute === 0) c.onTheHour++
    if (t.month === 1 && t.day === 1) c.newYear++
    if (t.month === 12 && t.day === 25) c.christmas++
    if (t.month === 4 && t.day === 1) c.aprilFool++
    if (t.month === 10 && t.day === 31) c.halloween++
    if (t.month === 12 && t.day === 31) c.newYearEve++
    if (t.day === 13 && t.weekday === "Fri") c.friday13++
    if (t.weekday === "Sun") c.sunday++
    if (Math.abs(r.distance - 6700) <= 50 || pace === 367) c.sixSeven++
    if (Math.abs(r.distance - 3140) <= 40) c.pi++
    if (r.distance >= 5000 && pace > 0 && pace < 240) c.fast++
    if (pace > 480) c.slow++
    const offKm = r.distance % 1000
    if (r.distance >= 3000 && (offKm <= 10 || offKm >= 990)) c.roundKm++
    if (isPalindromeDuration(r.duration)) c.palindrome++
    if (r.distance >= 3000 && pace > 0)
      paces.set(pace, (paces.get(pace) ?? 0) + 1)

    const day = `${t.year}-${t.month}-${t.day}`
    perDay.set(day, (perDay.get(day) ?? 0) + 1)
    const week = mondayOf(r.date)
    perWeek.set(week, (perWeek.get(week) ?? 0) + r.distance)
    const month = `${t.year}-${t.month}`
    perMonth.set(month, (perMonth.get(month) ?? 0) + r.distance)
  }

  return {
    ...context,
    totalKm: runs.reduce((s, r) => s + r.distance, 0) / 1000,
    totalRuns: runs.length,
    totalElevation: runs.reduce((s, r) => s + r.elevation, 0),
    longestRunKm: runs.reduce((m, r) => Math.max(m, r.distance), 0) / 1000,
    maxConsecutiveWeeks: maxConsecutiveWeeks(runs.map((r) => r.date)),
    maxWeekKm: maxOf(perWeek.values()) / 1000,
    maxMonthKm: maxOf(perMonth.values()) / 1000,
    earlyRuns: c.early,
    lateRuns: c.late,
    newYearRuns: c.newYear,
    sixSevenRuns: c.sixSeven,
    piRuns: c.pi,
    nightRuns: c.night,
    christmasRuns: c.christmas,
    friday13Runs: c.friday13,
    aprilFoolRuns: c.aprilFool,
    halloweenRuns: c.halloween,
    newYearEveRuns: c.newYearEve,
    sundayRuns: c.sunday,
    doubleDays: [...perDay.values()].filter((n) => n >= 2).length,
    fastRuns: c.fast,
    slowRuns: c.slow,
    onTheHourRuns: c.onTheHour,
    roundKmRuns: c.roundKm,
    palindromeRuns: c.palindrome,
    samePaceRuns: [...paces.values()]
      .filter((n) => n >= 2)
      .reduce((s, n) => s + n, 0),
    // Les badges collectifs ne vont qu'aux membres qui ont couru au moins une fois.
    groupKm: runs.length > 0 ? context.groupKm : 0,
    groupElevation: runs.length > 0 ? context.groupElevation : 0,
  }
}
