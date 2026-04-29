import { up } from "up-fetch"
import { env } from "@/env"
import { runRoute } from "@/lib/constants/routes"

const discordFetch = up(fetch, () => ({
  baseUrl: env.DISCORD_WEBHOOK_URL,
}))

interface RunNotificationPayload {
  runId: string
  userName: string
  runName: string
}

export async function sendRunNotification(run: RunNotificationPayload) {
  const runUrl = `${env.NEXT_PUBLIC_APP_URL}${runRoute(run.runId)}`

  await discordFetch("", {
    method: "POST",
    body: {
      embeds: [
        {
          color: 0xfc4c02,
          author: { name: run.userName },
          title: run.runName,
          url: runUrl,
          description: `**${run.userName}** vient de terminer une course !`,
          image: { url: `${env.NEXT_PUBLIC_APP_URL}/api/og/run/${run.runId}` },
        },
      ],
    },
  })
}
