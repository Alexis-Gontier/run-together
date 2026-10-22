import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { ogRankingRoute } from "@/lib/constants/routes"
import { OG_MAX_RANKING } from "@/lib/og/theme"
import { parisCalendarDate, parisDay } from "@/lib/utils/paris"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR, km } from "./common"

export type MonthlyRankingData = {
  monthStart: Date // 1er du mois 00:00, heure de Paris
  totalDistance: number
  totalRuns: number
  /** Trié par distance décroissante. */
  ranking: { name: string; distance: number; runs: number }[]
}

// La description d'un embed est limitée à 4096 caractères : large marge.
const MAX_LINES = 30

/** « septembre 2026 » — le mois de Paris où commence la fenêtre. */
export function formatMonth(monthStart: Date): string {
  return format(parisCalendarDate(monthStart), "MMMM yyyy", { locale: fr })
}

/**
 * Image : totaux du groupe et premiers du classement. Le texte ne liste que la suite du
 * classement, quand il y a plus de coureurs que l'image ne peut en montrer.
 */
export function buildMonthlyRankingMessage(
  data: MonthlyRankingData,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  const rest = data.ranking
    .slice(OG_MAX_RANKING, MAX_LINES)
    .map(
      (r, i) =>
        `**${OG_MAX_RANKING + i + 1}.** ${r.name} — **${km(r.distance)} km** · ${r.runs} course${r.runs > 1 ? "s" : ""}`,
    )

  return {
    embeds: [
      {
        color: BRAND_COLOR,
        description: rest.length > 0 ? rest.join("\n") : undefined,
        image: {
          url: base + ogRankingRoute(parisDay(data.monthStart).slice(0, 7)),
        },
      },
    ],
  }
}
