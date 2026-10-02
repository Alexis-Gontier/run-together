import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR, FOOTER, km } from "./common"

export type MonthlyRankingData = {
  monthStart: Date // 1er du mois 00:00 UTC
  totalDistance: number
  totalRuns: number
  /** Trié par distance décroissante. */
  ranking: { name: string; distance: number; runs: number }[]
}

const MEDALS = ["🥇", "🥈", "🥉"]
// La description d'un embed est limitée à 4096 caractères : large marge.
const MAX_LINES = 30

/** « septembre 2026 » — le mois lu en UTC (le 1er à minuit UTC). */
export function formatMonth(monthStart: Date): string {
  const d = new Date(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1)
  return format(d, "MMMM yyyy", { locale: fr })
}

export function buildMonthlyRankingMessage(
  data: MonthlyRankingData,
): DiscordMessage {
  const lines = data.ranking
    .slice(0, MAX_LINES)
    .map(
      (r, i) =>
        `${MEDALS[i] ?? `**${i + 1}.**`} ${r.name} — **${km(r.distance)} km** · ${r.runs} course${r.runs > 1 ? "s" : ""}`,
    )
  const runners = data.ranking.length

  return {
    embeds: [
      {
        color: BRAND_COLOR,
        title: `🏁 Classement de ${formatMonth(data.monthStart)}`,
        description: [
          `**${runners}** coureur${runners > 1 ? "s" : ""} · **${data.totalRuns}** course${data.totalRuns > 1 ? "s" : ""} · **${km(data.totalDistance)} km** au total`,
          "",
          ...lines,
        ].join("\n"),
        footer: FOOTER,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}
