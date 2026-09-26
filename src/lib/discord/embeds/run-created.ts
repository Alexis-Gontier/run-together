import { ogRunRoute, profileRoute, runRoute } from "@/lib/constants/routes"
import type { NewPR } from "@/lib/runs/personal-records"
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"
import type { DiscordEmbed, DiscordMessage } from "../client"
import { BRAND_COLOR, FOOTER, km, RECORD_COLOR } from "./common"

export type RunCreatedData = {
  runId: string
  runName: string
  userName: string
  username: string | null
  distance: number
  duration: number
  pace: number
  elevation: number
  heartRateAvg: number | null
  date: Date
  sportType: string | null
  newPRs: NewPR[]
}

const SPORT_SUFFIX: Record<string, string> = {
  TrailRun: " · Trail",
  VirtualRun: " · Tapis",
}

/** Gain sur l'ancien record : « −52 s » sous la minute, « −1'05" » au-delà. */
function formatGain(seconds: number): string {
  return seconds < 60
    ? `−${seconds} s`
    : `−${formatRunDurationDisplay(seconds)}`
}

function formatRecord(pr: NewPR): string {
  const line = `**${PR_DISTANCE_LABELS[pr.distance]}** — ${formatRunDurationDisplay(pr.duration)}`
  if (pr.previousDuration == null) return `${line} (premier record)`
  return `${line} (ancien : ${formatRunDurationDisplay(pr.previousDuration)}, ${formatGain(pr.previousDuration - pr.duration)})`
}

export function buildRunCreatedMessage(
  data: RunCreatedData,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  const hasRecords = data.newPRs.length > 0

  const fields: NonNullable<DiscordEmbed["fields"]> = [
    { name: "Distance", value: `${km(data.distance)} km`, inline: true },
    { name: "Allure", value: `${formatRunPace(data.pace)} /km`, inline: true },
    {
      name: "Durée",
      value: formatRunDurationDisplay(data.duration),
      inline: true,
    },
  ]
  if (data.elevation > 0)
    fields.push({ name: "D+", value: `${data.elevation} m`, inline: true })
  if (data.heartRateAvg)
    fields.push({
      name: "FC moyenne",
      value: `${data.heartRateAvg} bpm`,
      inline: true,
    })
  if (hasRecords)
    fields.push({
      name:
        data.newPRs.length > 1
          ? "🏆 Records personnels"
          : "🏆 Record personnel",
      value: data.newPRs.map(formatRecord).join("\n"),
    })

  return {
    embeds: [
      {
        color: hasRecords ? RECORD_COLOR : BRAND_COLOR,
        author: {
          name: data.userName,
          url: data.username ? base + profileRoute(data.username) : undefined,
        },
        title: data.runName,
        url: base + runRoute(data.runId),
        description: `**${data.userName}** a couru **${km(data.distance)} km** en **${formatRunDurationDisplay(data.duration)}**${SPORT_SUFFIX[data.sportType ?? ""] ?? ""}`,
        fields,
        image: { url: base + ogRunRoute(data.runId) },
        timestamp: data.date.toISOString(),
        footer: FOOTER,
      },
    ],
  }
}
