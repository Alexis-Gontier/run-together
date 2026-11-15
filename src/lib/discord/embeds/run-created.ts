import { ogRunRoute, runRoute } from "@/lib/constants/routes"
import {
  formatRunDistance,
  formatRunDurationDisplay,
  formatRunPace,
} from "@/lib/utils/run"
import type { DiscordMessage } from "../client"
import { BRAND_COLOR, RECORD_COLOR } from "./common"

export type RunCreatedData = {
  runId: string
  hasRecords: boolean
  userName: string
  distance: number // mètres
  duration: number // secondes
  pace: number // s/km
}

/**
 * L'image porte coureur, course, date et stats. Le titre de l'embed les résume quand même
 * (sans lui, la notification push sur téléphone arrive vide) et sert de lien vers la course.
 * Les records partent ensuite dans un message texte à part (`buildRecordSetMessage`).
 */
export function buildRunCreatedMessage(
  data: RunCreatedData,
  appUrl: string,
): DiscordMessage {
  const base = appUrl.replace(/\/$/, "")
  return {
    embeds: [
      {
        title: `${data.userName} a couru ${formatRunDistance(data.distance)} km en ${formatRunDurationDisplay(data.duration)} (${formatRunPace(data.pace)}/km)`,
        url: base + runRoute(data.runId),
        color: data.hasRecords ? RECORD_COLOR : BRAND_COLOR,
        image: { url: base + ogRunRoute(data.runId) },
      },
    ],
  }
}
