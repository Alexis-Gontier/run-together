import { profileRoute } from "@/lib/constants/routes"
import { displayName } from "@/lib/utils/display-name"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR, FOOTER } from "./common"

export function buildMemberJoinedMessage(
  user: { name: string; username: string | null },
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  return {
    embeds: [
      {
        color: BRAND_COLOR,
        title: `👋 Bienvenue ${displayName(user)} !`,
        url: user.username ? base + profileRoute(user.username) : undefined,
        description: `**${displayName(user)}** vient de rejoindre Run Together. Première sortie à suivre !`,
        footer: FOOTER,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function buildTestMessage(adminName: string): DiscordMessage {
  return {
    embeds: [
      {
        color: BRAND_COLOR,
        title: "✅ Webhook opérationnel",
        description: `Message de test envoyé par **${adminName}** depuis l'administration.`,
        footer: FOOTER,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}
