import type { NewPR } from "@/lib/runs/personal-records"
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { formatRunDurationDisplay } from "@/lib/utils/run"
import type { DiscordMessage } from "../client"

/** Gain sur l'ancien record : « −52 s » sous la minute, « −1'05" » au-delà. */
function formatGain(seconds: number): string {
  return seconds < 60
    ? `−${seconds} s`
    : `−${formatRunDurationDisplay(seconds)}`
}

/** « **5 km** en **30'50"** (ancien : 31'42", −52 s) » */
function formatRecord(pr: NewPR): string {
  const line = `**${PR_DISTANCE_LABELS[pr.distance]}** en **${formatRunDurationDisplay(pr.duration)}**`
  if (pr.previousDuration == null) return `${line} (premier record)`
  return `${line} (ancien : ${formatRunDurationDisplay(pr.previousDuration)}, ${formatGain(pr.previousDuration - pr.duration)})`
}

/** En-tête de la liste : on ne « bat » que des records qui existaient déjà. */
function listHeader(userName: string, newPRs: NewPR[]): string {
  const n = newPRs.length
  const firsts = newPRs.filter((pr) => pr.previousDuration == null).length
  if (firsts === n) return `🏆 **${userName}** signe ${n} premiers records :`
  if (firsts === 0) return `🏆 **${userName}** bat ${n} records perso :`
  return `🏆 **${userName}** a ${n} nouveaux records perso :`
}

/** Message texte simple, sans embed, envoyé juste après la course qui bat des records. */
export function buildRecordSetMessage(
  userName: string,
  newPRs: NewPR[],
): DiscordMessage {
  const [first] = newPRs
  const content =
    newPRs.length === 1
      ? first.previousDuration == null
        ? `🏆 **${userName}** signe son premier record sur **${PR_DISTANCE_LABELS[first.distance]}** : **${formatRunDurationDisplay(first.duration)}**`
        : `🏆 **${userName}** bat son record sur ${formatRecord(first)}`
      : [
          listHeader(userName, newPRs),
          ...newPRs.map((pr) => `- ${formatRecord(pr)}`),
        ].join("\n")
  return { content, embeds: [] }
}
