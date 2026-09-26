import { ogBadgesRoute, profileRoute, ROUTES } from "@/lib/constants/routes"
import type { DiscordMessage } from "../client"
import { FOOTER, RECORD_COLOR } from "./common"

type UnlockedBadge = { emoji: string; name: string; description: string }

/** Un message par course, qui liste tous les badges qu'elle a débloqués. */
export function buildBadgeUnlockedMessage(
  user: { name: string; username: string | null },
  badges: UnlockedBadge[],
  runId: string,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  const plural = badges.length > 1
  return {
    embeds: [
      {
        color: RECORD_COLOR,
        title: plural
          ? `🏅 ${user.name} débloque ${badges.length} badges`
          : `🏅 ${user.name} débloque un badge`,
        url: user.username
          ? base + profileRoute(user.username)
          : base + ROUTES.BADGES,
        fields: badges.map((b) => ({
          name: `${b.emoji} ${b.name}`,
          value: b.description,
        })),
        image: { url: base + ogBadgesRoute(runId) },
        footer: FOOTER,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}
