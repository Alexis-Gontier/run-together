"use server"

import { z } from "zod"
import { RunSource } from "@/generated/prisma/client"
import {
  findDuplicateRun,
  findNearbyRun,
  recordRun,
} from "@/lib/runs/record-run"
import { recordRunInputSchema } from "@/lib/runs/schemas"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { displayName } from "@/lib/utils/display-name"

/**
 * Une course partie à ±30 min d'une existante (même sortie mesurée par une autre montre ?)
 * n'est enregistrée qu'avec `force` : sinon l'existante est renvoyée pour confirmation.
 */
export const createRunAction = authActionClient
  .inputSchema(
    z.object({
      values: recordRunInputSchema,
      publish: z.boolean(),
      force: z.boolean().optional(),
    }),
  )
  .action(
    async ({ parsedInput: { values, publish, force }, ctx: { user } }) => {
      if (await findDuplicateRun(user.id, values)) {
        return { error: "Une course quasi identique existe déjà à cette date." }
      }
      if (!force) {
        const nearby = await findNearbyRun(user.id, values.date)
        if (nearby) return { nearby }
      }
      const { run } = await recordRun(values, {
        userId: user.id,
        userName: displayName(user),
        source: RunSource.MANUAL,
        notify: publish,
      })
      return { runId: run.id }
    },
  )
