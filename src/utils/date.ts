export function formatSecondsToHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h:${String(minutes).padStart(2, '0')}m:${String(seconds).padStart(2, '0')}s`
  } else if (minutes > 0) {
    return `${minutes}m:${String(seconds).padStart(2, '0')}s`
  }

  return `${seconds}s`
}