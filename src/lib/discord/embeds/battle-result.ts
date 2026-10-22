import { ogBattleRoute } from "@/lib/constants/routes"
import type { StatsPeriod } from "@/lib/stats/periods"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR, RECORD_COLOR } from "./common"

export type BattleResultData = {
  /** `a` = celui qui publie. */
  a: { id: string; points: number }
  b: { id: string; points: number }
  period: StatsPeriod
  /** Jour de publication (yyyy-MM-dd) : la période se termine ce jour-là. */
  day: string
}

/** Image seule : noms, score et chaque ligne du duel sont dessinés dessus. */
export function buildBattleResultMessage(
  data: BattleResultData,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  const { a, b } = data
  return {
    embeds: [
      {
        color: a.points === b.points ? BRAND_COLOR : RECORD_COLOR,
        image: { url: base + ogBattleRoute(a.id, b.id, data.period, data.day) },
      },
    ],
  }
}
