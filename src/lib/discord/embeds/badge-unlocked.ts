import { ogBadgesRoute } from "@/lib/constants/routes"
import type { DiscordMessage } from "../client"
import { RECORD_COLOR } from "./common"

/**
 * Un message par course, image seule : le coureur et les badges (nom, catégorie,
 * description) sont dessinés dessus, avec « + N autres » au-delà de `OG_MAX_BADGES`.
 */
export function buildBadgeUnlockedMessage(
  runId: string,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  return {
    embeds: [
      { color: RECORD_COLOR, image: { url: base + ogBadgesRoute(runId) } },
    ],
  }
}
