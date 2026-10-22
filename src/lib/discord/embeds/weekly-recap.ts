import { format, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import type { PRDistance } from "@/generated/prisma/enums"
import { ogRecapRoute } from "@/lib/constants/routes"
import { OG_MAX_RECAP_RECORDS } from "@/lib/og/theme"
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { parisCalendarDate, parisDay } from "@/lib/utils/paris"
import { formatRunDurationDisplay } from "@/lib/utils/run"
import type { DiscordEmbed, DiscordMessage } from "../client"
import { BRAND_COLOR } from "./common"

export type WeeklyRecapData = {
  weekStart: Date // lundi 00:00 (heure de Paris) inclus
  weekEnd: Date // lundi suivant 00:00 exclu
  totalDistance: number
  totalRuns: number
  runners: number
  topDistance: { name: string; distance: number }[]
  topRuns: { name: string; runs: number }[]
  bestPace: { name: string; pace: number; distance: number } | null
  records: { name: string; distance: PRDistance; duration: number }[]
}

/** Jour du mois à la française : « 1er », puis « 2 », « 3 »… */
function day(date: Date): string {
  const d = date.getDate()
  return d === 1 ? "1er" : String(d)
}

/**
 * « du 21 au 27 septembre », « du 1er au 7 juin », « du 29 septembre au 5 octobre ».
 * Jours de Paris, quel que soit le fuseau du serveur.
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const start = parisCalendarDate(weekStart)
  const last = parisCalendarDate(subDays(weekEnd, 1))
  const sameMonth = start.getMonth() === last.getMonth()
  const from = sameMonth
    ? day(start)
    : `${day(start)} ${format(start, "MMMM", { locale: fr })}`
  return `du ${from} au ${day(last)} ${format(last, "MMMM", { locale: fr })}`
}

// Discord refuse tout le message si la valeur d'un champ dépasse 1024 caractères.
const FIELD_MAX = 1024

/** Lignes jointes tant qu'elles tiennent dans un champ, la fin résumée en « … et N autres ». */
export function fitField(lines: string[]): string {
  const kept: string[] = []
  for (const [i, line] of lines.entries()) {
    const isLast = i === lines.length - 1
    const more = `… et ${lines.length - i} autres`
    const next = [...kept, line].join("\n")
    if (next.length + (isLast ? 0 : more.length + 1) > FIELD_MAX)
      return [...kept, more].join("\n")
    kept.push(line)
  }
  return kept.join("\n")
}

/**
 * Image seule : totaux, podiums distance et régularité, meilleure allure et records. Le
 * texte ne liste que les records qu'elle n'a pas la place de montrer.
 */
export function buildWeeklyRecapMessage(
  data: WeeklyRecapData,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  const rest = data.records.slice(OG_MAX_RECAP_RECORDS)
  const fields: NonNullable<DiscordEmbed["fields"]> =
    rest.length > 0
      ? [
          {
            name: "🏆 Autres records de la semaine",
            value: fitField(
              rest.map(
                (r) =>
                  `${r.name} — **${PR_DISTANCE_LABELS[r.distance]}** en ${formatRunDurationDisplay(r.duration)}`,
              ),
            ),
          },
        ]
      : []

  return {
    embeds: [
      {
        color: BRAND_COLOR,
        fields,
        image: {
          url: base + ogRecapRoute(parisDay(data.weekStart)),
        },
      },
    ],
  }
}
