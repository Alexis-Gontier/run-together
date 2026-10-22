import { ogRunRoute } from "@/lib/constants/routes"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR, RECORD_COLOR } from "./common"

/**
 * Image seule : coureur, course, date et stats sont dessinés dessus. Les records partent
 * ensuite dans un message texte à part (`buildRecordSetMessage`).
 */
export function buildRunCreatedMessage(
  data: { runId: string; hasRecords: boolean },
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  return {
    embeds: [
      {
        color: data.hasRecords ? RECORD_COLOR : BRAND_COLOR,
        image: { url: base + ogRunRoute(data.runId) },
      },
    ],
  }
}
