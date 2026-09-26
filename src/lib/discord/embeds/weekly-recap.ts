import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import type { PRDistance } from "@/generated/prisma/enums"
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"
import type { DiscordEmbed, DiscordMessage } from "../client"
import { BRAND_COLOR, FOOTER, km } from "./common"

export type WeeklyRecapData = {
  weekStart: Date // lundi 00:00 inclus
  weekEnd: Date // lundi suivant 00:00 exclu
  totalDistance: number
  totalRuns: number
  runners: number
  topDistance: { name: string; distance: number }[]
  topRuns: { name: string; runs: number }[]
  bestPace: { name: string; pace: number; distance: number } | null
  records: { name: string; distance: PRDistance; duration: number }[]
}

const MEDALS = ["🥇", "🥈", "🥉"]

function podium(lines: string[]): string {
  return lines
    .map((line, i) => `${MEDALS[i] ?? `${i + 1}.`} ${line}`)
    .join("\n")
}

/** Jour du mois à la française : « 1er », puis « 2 », « 3 »… */
function day(date: Date): string {
  const d = date.getDate()
  return d === 1 ? "1er" : String(d)
}

/** « du 21 au 27 septembre », « du 1er au 7 juin », « du 29 septembre au 5 octobre ». */
export function formatWeekRange(start: Date, end: Date): string {
  const last = subDays(end, 1)
  const sameMonth = start.getMonth() === last.getMonth()
  const from = sameMonth
    ? day(start)
    : `${day(start)} ${format(start, "MMMM", { locale: fr })}`
  return `du ${from} au ${day(last)} ${format(last, "MMMM", { locale: fr })}`
}

export function buildWeeklyRecapMessage(data: WeeklyRecapData): DiscordMessage {
  const fields: NonNullable<DiscordEmbed["fields"]> = []

  if (data.topDistance.length > 0)
    fields.push({
      name: "Distance",
      value: podium(
        data.topDistance.map((r) => `${r.name} — ${km(r.distance)} km`),
      ),
      inline: true,
    })
  if (data.topRuns.length > 0)
    fields.push({
      name: "Régularité",
      value: podium(
        data.topRuns.map(
          (r) => `${r.name} — ${r.runs} course${r.runs > 1 ? "s" : ""}`,
        ),
      ),
      inline: true,
    })
  if (data.bestPace)
    fields.push({
      name: "⚡ Meilleure allure",
      value: `${data.bestPace.name} — ${formatRunPace(data.bestPace.pace)} /km sur ${km(data.bestPace.distance)} km`,
    })
  if (data.records.length > 0)
    fields.push({
      name: "🏆 Records de la semaine",
      value: data.records
        .map(
          (r) =>
            `${r.name} — **${PR_DISTANCE_LABELS[r.distance]}** en ${formatRunDurationDisplay(r.duration)}`,
        )
        .join("\n"),
    })

  return {
    embeds: [
      {
        color: BRAND_COLOR,
        title: `📊 Récap de la semaine ${formatWeekRange(data.weekStart, data.weekEnd)}`,
        description: `**${data.runners}** coureur${data.runners > 1 ? "s" : ""} · **${data.totalRuns}** course${data.totalRuns > 1 ? "s" : ""} · **${km(data.totalDistance)} km** au total`,
        fields,
        footer: FOOTER,
        timestamp: data.weekEnd.toISOString(),
      },
    ],
  }
}
