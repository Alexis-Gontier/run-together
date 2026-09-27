"use server"

import { z } from "zod"
import { RunSource } from "@/generated/prisma/client"
import { findDuplicateRun, recordRun } from "@/lib/runs/record-run"
import { RUN_SPORT_TYPES, recordRunInputSchema } from "@/lib/runs/schemas"
import { parseTrackFile } from "@/lib/runs/track/parse-track"
import { trackSummaryToRunInput } from "@/lib/runs/track/summary-to-input"
import { NotARunError, TrackParseError } from "@/lib/runs/track/types"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { displayName } from "@/lib/utils/display-name"

const MAX_BYTES = 15 * 1024 * 1024

/**
 * Import en masse, un fichier par appel : enregistre la course directement, sans formulaire ni
 * notification Discord (rattrapage d'historique). Un doublon ou un autre sport est ignoré, pas
 * une erreur. `name` / `sportType` viennent de `activities.csv` (archive Strava) s'il est fourni.
 */
export const importTrackFileAction = authActionClient
  .inputSchema(
    z.object({
      file: z
        .instanceof(File, { message: "Fichier manquant." })
        .refine((f) => f.size <= MAX_BYTES, "Fichier trop lourd (15 Mo max)."),
      name: z.string().trim().max(100).optional(),
      sportType: z.enum(RUN_SPORT_TYPES).optional(),
    }),
  )
  .action(async ({ parsedInput: { file, ...meta }, ctx: { user } }) => {
    let summary: ReturnType<typeof parseTrackFile>
    try {
      summary = parseTrackFile(
        file.name,
        new Uint8Array(await file.arrayBuffer()),
      )
    } catch (err) {
      if (err instanceof NotARunError)
        return { status: "skipped" as const, message: "Pas une course" }
      if (err instanceof TrackParseError)
        return { status: "error" as const, message: err.message }
      throw err
    }

    const input = trackSummaryToRunInput(summary)
    const parsed = recordRunInputSchema.safeParse({
      ...input,
      name: meta.name || input.name,
      sportType: meta.sportType ?? input.sportType,
    })
    if (!parsed.success) {
      return {
        status: "error" as const,
        message: parsed.error.issues[0]?.message ?? "Données invalides.",
      }
    }
    const values = parsed.data

    if (await findDuplicateRun(user.id, values)) {
      return { status: "duplicate" as const }
    }

    const { run } = await recordRun(values, {
      userId: user.id,
      userName: displayName(user),
      source: RunSource.MANUAL,
      notify: false,
    })
    return {
      status: "imported" as const,
      runId: run.id,
      date: run.date,
      distance: run.distance,
    }
  })
