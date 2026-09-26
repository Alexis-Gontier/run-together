const DAY_MS = 24 * 60 * 60 * 1000

/** Date → « yyyy-MM-dd » (UTC), clé de jour commune aux calculs de régularité. */
export function toDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
}

/** Plus longue suite de jours consécutifs avec au moins une course. */
export function computeBestStreak(activeDateSet: Set<string>): number {
  const sortedDays = Array.from(activeDateSet).sort()
  let best = sortedDays.length > 0 ? 1 : 0
  let running = best
  for (let i = 1; i < sortedDays.length; i++) {
    const diffDays = Math.round(
      (new Date(`${sortedDays[i]}T00:00:00Z`).getTime() -
        new Date(`${sortedDays[i - 1]}T00:00:00Z`).getTime()) /
        DAY_MS,
    )
    if (diffDays === 1) {
      running++
      if (running > best) best = running
    } else {
      running = 1
    }
  }
  return best
}

/**
 * Série en cours : jours consécutifs jusqu'à aujourd'hui, ou jusqu'à hier si l'utilisateur
 * n'a pas encore couru aujourd'hui (sinon la série « tombe » chaque matin).
 */
export function computeCurrentStreak(
  allDateSet: Set<string>,
  now: Date = new Date(),
): number {
  const cursor = new Date(`${toDateStr(now)}T00:00:00Z`)
  if (!allDateSet.has(toDateStr(cursor)))
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streak = 0
  while (allDateSet.has(toDateStr(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}
