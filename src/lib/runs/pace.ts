export function computePace(distanceM: number, durationS: number): number {
  if (distanceM <= 0) return 0
  return Math.round((durationS / distanceM) * 1000)
}

/** Nom proposé quand l'utilisateur n'en donne pas, d'après l'heure locale de départ. */
export function defaultRunName(date: Date): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return "Course du matin"
  if (h >= 12 && h < 14) return "Course du midi"
  if (h >= 14 && h < 18) return "Course de l'après-midi"
  if (h >= 18 && h < 22) return "Course du soir"
  return "Course de nuit"
}
