"use server"

import { z } from "zod"
import { parseTrackFile } from "@/lib/runs/track/parse-track"
import { TrackParseError } from "@/lib/runs/track/types"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

const MAX_BYTES = 15 * 1024 * 1024

export const parseTrackAction = authActionClient
  .inputSchema(
    z.object({
      file: z
        .instanceof(File, { message: "Fichier manquant." })
        .refine((f) => f.size <= MAX_BYTES, "Fichier trop lourd (15 Mo max)."),
    }),
  )
  .action(async ({ parsedInput: { file } }) => {
    try {
      const summary = parseTrackFile(
        file.name,
        new Uint8Array(await file.arrayBuffer()),
      )
      return { summary }
    } catch (err) {
      if (err instanceof TrackParseError) return { error: err.message }
      throw err
    }
  })
