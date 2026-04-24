import { env } from "@/env"

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatPace(paceSecondsPerKm: number): string {
  const m = Math.floor(paceSecondsPerKm / 60)
  const s = paceSecondsPerKm % 60
  return `${m}:${String(s).padStart(2, "0")}/km`
}

interface RunNotificationPayload {
  userName: string
  runName: string
  distanceMeters: number
  durationSeconds: number
  paceSecondsPerKm: number
  elevationMeters: number
  heartRateAvg?: number | null
}

export async function sendRunNotification(run: RunNotificationPayload) {
  const km = (run.distanceMeters / 1000).toFixed(2)
  const duration = formatDuration(run.durationSeconds)
  const pace = formatPace(run.paceSecondsPerKm)

  const lines = [
    `**${run.userName}** vient de terminer une course !`,
    `**${run.runName}**`,
    `${km} km · ${duration} · ${pace} · +${run.elevationMeters}m`,
  ]

  if (run.heartRateAvg) {
    lines.push(`♥ ${run.heartRateAvg} bpm`)
  }

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: lines.join("\n") }),
  })
}
