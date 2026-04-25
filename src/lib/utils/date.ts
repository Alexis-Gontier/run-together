export function getPeriodRange(
  period: string,
  daysMap: Record<string, number>,
): {
  currentStart: Date
  currentEnd: Date
  prevStart: Date | null
  prevEnd: Date | null
} {
  const now = new Date()
  now.setUTCHours(23, 59, 59, 999)

  if (period === "all") {
    return {
      currentStart: new Date(0),
      currentEnd: now,
      prevStart: null,
      prevEnd: null,
    }
  }

  const days = daysMap[period]

  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  currentStart.setUTCHours(0, 0, 0, 0)

  const prevEnd = new Date(currentStart.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - days * 24 * 60 * 60 * 1000)
  prevStart.setUTCHours(0, 0, 0, 0)

  return { currentStart, currentEnd: now, prevStart, prevEnd }
}
