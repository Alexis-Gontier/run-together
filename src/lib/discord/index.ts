import { env } from "@/env"
import { runRoute } from "@/lib/constants/routes"

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
  runId: string
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
  const runUrl = `${env.NEXT_PUBLIC_APP_URL}${runRoute(run.runId)}`

  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: "Distance", value: `${km} km`, inline: true },
    { name: "Durée", value: duration, inline: true },
    { name: "Allure", value: pace, inline: true },
    { name: "Dénivelé", value: `+${run.elevationMeters} m`, inline: true },
  ]

  if (run.heartRateAvg) {
    fields.push({
      name: "Fréquence cardiaque",
      value: `♥ ${run.heartRateAvg} bpm`,
      inline: true,
    })
  }

  const embed = {
    color: 0xfc4c02,
    author: { name: run.userName },
    title: run.runName,
    url: runUrl,
    description: `**${run.userName}** vient de terminer une course !`,
    fields,
    image: { url: `${env.NEXT_PUBLIC_APP_URL}/api/og/run/${run.runId}` },
  }

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  })
}
