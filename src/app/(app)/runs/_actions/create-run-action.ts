"use server"

import { z } from "zod"
import { RunSource } from "@/generated/prisma/client"
import { findDuplicateRun, recordRun } from "@/lib/runs/record-run"
import { recordRunInputSchema } from "@/lib/runs/schemas"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const createRunAction = authActionClient
  .inputSchema(z.object({ values: recordRunInputSchema, publish: z.boolean() }))
  .action(async ({ parsedInput: { values, publish }, ctx: { user } }) => {
    if (await findDuplicateRun(user.id, values)) {
      return { error: "Une course quasi identique existe déjà à cette date." }
    }
    const { run } = await recordRun(values, {
      userId: user.id,
      userName: user.name,
      source: RunSource.MANUAL,
      notify: publish,
    })
    return { runId: run.id }
  })
