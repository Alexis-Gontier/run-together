"use server"

import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { feedSchema } from "../_schemas/feed-schema"

import { z } from "zod"

export const getFeedAction = authActionClient
  .inputSchema(feedSchema)
  .action(async ({ parsedInput: { cursor, limit } }) => {
    const runs = await prisma.run.findMany({
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
            skip: 1,
          }
        : {}),
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
      orderBy: {
        date: "desc",
      },
    })

    const hasMore = runs.length > limit
    const items = hasMore ? runs.slice(0, -1) : runs
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return {
      runs: items,
      nextCursor,
      hasMore,
    }
  })
