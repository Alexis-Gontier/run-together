import type { DiscordMessage } from "../client"
import { BRAND_COLOR, FOOTER, RECORD_COLOR } from "./common"

type Fighter = {
  name: string
  points: number
  /** Lignes gagnées, avec la valeur : « Distance — 120,5 km ». */
  wins: string[]
}

export type BattleResultData = {
  a: Fighter
  b: Fighter
  /** « sur 3 mois », « depuis toujours »… */
  periodPhrase: string
}

const pts = (n: number) => `${n} pt${n > 1 ? "s" : ""}`

export function buildBattleResultMessage(
  data: BattleResultData,
): DiscordMessage {
  const { a, b } = data
  const winner = a.points === b.points ? null : a.points > b.points ? a : b
  const field = (f: Fighter) => ({
    name: `${f === winner ? "🏆 " : ""}${f.name} — ${pts(f.points)}`,
    value: f.wins.length > 0 ? f.wins.join("\n") : "Aucun point",
    inline: true,
  })

  return {
    embeds: [
      {
        color: winner ? RECORD_COLOR : BRAND_COLOR,
        title: `⚔️ Bataille : ${a.name} vs ${b.name}`,
        description: `${
          winner ? `**${winner.name}** l'emporte` : "**Match nul**"
        } ${data.periodPhrase} : **${a.points} – ${b.points}**`,
        fields: [field(a), field(b)],
        footer: FOOTER,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}
