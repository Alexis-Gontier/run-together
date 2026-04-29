"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action/action-client"
import { prisma } from "@/lib/db/prisma"

const schema = z.object({
  username: z.string(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(10),
})

export const getProfileRunsAction = actionClient
  .inputSchema(schema)
  .action(async ({ parsedInput: { username, cursor, limit } }) => {
    const runs = await prisma.run.findMany({
      where: { user: { username } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        personalRecords: {
          select: { distance: true },
        },
      },
      orderBy: { date: "desc" },
    })

    const hasMore = runs.length > limit
    const items = hasMore ? runs.slice(0, -1) : runs
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return { runs: items, nextCursor, hasMore }
  })
