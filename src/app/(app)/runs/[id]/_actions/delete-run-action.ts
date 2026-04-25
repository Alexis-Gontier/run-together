"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { z } from "zod"

export const deleteRunAction = authActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    await prisma.run.delete({ where: { id, userId: user.id } })
  })
