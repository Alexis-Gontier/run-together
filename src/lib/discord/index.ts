import { env } from "@/env"
import { runRoute } from "@/lib/constants/routes"

interface RunNotificationPayload {
  runId: string
  userName: string
  runName: string
}

export async function sendRunNotification(run: RunNotificationPayload) {
  const runUrl = `${env.NEXT_PUBLIC_APP_URL}${runRoute(run.runId)}`

  const embed = {
    color: 0xfc4c02,
    author: { name: run.userName },
    title: run.runName,
    url: runUrl,
    description: `**${run.userName}** vient de terminer une course !`,
    image: { url: `${env.NEXT_PUBLIC_APP_URL}/api/og/run/${run.runId}` },
  }

  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  })
}
