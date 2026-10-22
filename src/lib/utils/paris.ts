// Jours, semaines et mois du groupe se lisent à l'heure de Paris, pas en UTC.
const parisFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
})

/** Date et heure murales à Paris de cet instant (`month` de 1 à 12). */
export function parisParts(date: Date) {
  const p = Object.fromEntries(
    parisFormat.formatToParts(date).map((x) => [x.type, Number(x.value)]),
  )
  return {
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    second: p.second,
  }
}

/** Jour de Paris de cet instant, `yyyy-MM-dd`. */
export function parisDay(date: Date): string {
  const { year, month, day } = parisParts(date)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${year}-${pad(month)}-${pad(day)}`
}

/**
 * Instant de minuit à Paris pour ce jour (`month` de 1 à 12). Les débordements sont
 * normalisés comme avec `Date.UTC` : (2026, 9, 31) = 1er octobre.
 */
export function parisMidnight(year: number, month: number, day: number): Date {
  const wall = Date.UTC(year, month - 1, day)
  // Décalage de Paris à cet instant (1 h ou 2 h) : minuit ne tombe jamais sur un changement d'heure.
  const p = parisParts(new Date(wall))
  const offset =
    Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - wall
  return new Date(wall - offset)
}

/**
 * Jour de Paris de cet instant, à midi UTC : `format` de date-fns le lit au bon jour quel
 * que soit le fuseau du serveur.
 */
export function parisCalendarDate(date: Date): Date {
  const { year, month, day } = parisParts(date)
  return new Date(Date.UTC(year, month - 1, day, 12))
}
