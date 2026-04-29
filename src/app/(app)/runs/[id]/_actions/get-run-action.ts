"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"

import { z } from "zod"

const runSchema = z.object({
  id: z.string(),
})

export const getRunAction = authActionClient
  .inputSchema(runSchema)
  .action(async ({ parsedInput: { id } }) => {
    const run = await prisma.run.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        splits: {
          orderBy: { kilometer: "asc" },
        },
        personalRecords: {
          select: { distance: true },
        },
      },
    })
    return run
  })
