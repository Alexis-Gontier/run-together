import { ogMemberRoute, ogTestRoute } from "@/lib/constants/routes"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR } from "./common"

/** Image seule : avatar, bannière et « Bienvenue … ! » sont dessinés dessus. */
export function buildMemberJoinedMessage(
  userId: string,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  return {
    embeds: [
      { color: BRAND_COLOR, image: { url: base + ogMemberRoute(userId) } },
    ],
  }
}

/** Image seule : si elle s'affiche, le webhook et les images OG fonctionnent. */
export function buildTestMessage(appUrl: string): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  return {
    embeds: [
      {
        color: BRAND_COLOR,
        // Discord met les images en cache par URL : le test doit vraiment la recharger.
        image: { url: `${base}${ogTestRoute}?t=${Date.now()}` },
      },
    ],
  }
}
