import { isResponseError, up } from "up-fetch"
import { env } from "@/env"

export type DiscordEmbed = {
  title?: string
  url?: string
  description?: string
  color?: number
  author?: { name: string; url?: string; icon_url?: string }
  fields?: { name: string; value: string; inline?: boolean }[]
  image?: { url: string }
  thumbnail?: { url: string }
  footer?: { text: string }
  timestamp?: string
}

/** Bouton lien (style 5) : seul composant qu'un webhook non applicatif peut envoyer. */
export type DiscordLinkButton = {
  type: 2
  style: 5
  label: string
  url: string
}

export type DiscordMessage = {
  content?: string
  embeds: DiscordEmbed[]
  components?: { type: 1; components: DiscordLinkButton[] }[]
}

const discordFetch = up(fetch, () => ({
  baseUrl: env.DISCORD_WEBHOOK_URL,
  // `wait=true` : Discord renvoie le message créé, donc une vraie erreur si le corps est refusé.
  // `with_components=true` : sans lui, un webhook non applicatif ignore les boutons.
  params: { wait: true, with_components: true },
  retry: {
    attempts: 2,
    delay: 1000,
    when: ({ response }) =>
      response?.status === 429 || (response?.status ?? 0) >= 500,
  },
}))

/** Envoie un message au webhook. Lève en cas d'échec après les tentatives. */
export async function postToDiscord(message: DiscordMessage): Promise<void> {
  await discordFetch("", { method: "POST", body: message })
}

/** Message d'erreur lisible pour le journal (statut + corps renvoyé par Discord). */
export function describeDiscordError(err: unknown): string {
  if (isResponseError(err))
    return `${err.status} ${JSON.stringify(err.data)}`.slice(0, 500)
  return (err instanceof Error ? err.message : String(err)).slice(0, 500)
}
