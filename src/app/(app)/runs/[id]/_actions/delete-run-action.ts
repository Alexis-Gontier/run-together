"use server"

import { z } from "zod"
import { removeRun } from "@/lib/runs/record-run"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

export const deleteRunAction = authActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    await removeRun(user.id, id)
  })
