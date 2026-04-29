"use server"

import type { PRDistance } from "@/generated/prisma/client"
import { prisma } from "@/lib/db/prisma"
import { authActionClient } from "@/lib/safe-action/auth-action-client"
import { getPrLeaderboardSchema } from "../_schemas/leaderboard-schema"

export const getPrLeaderboardAction = authActionClient
  .inputSchema(getPrLeaderboardSchema)
  .action(async ({ parsedInput: { dist } }) => {
    const records = await prisma.personalRecord.findMany({
      where: { distance: dist as PRDistance },
      orderBy: { duration: "asc" },
      select: {
        duration: true,
        pace: true,
        run: { select: { id: true, name: true, date: true } },
        user: {
          select: { id: true, name: true, username: true, image: true },
        },
      },
    })

    return {
      entries: records.map((r, i) => ({
        rank: i + 1,
        user: r.user,
        duration: r.duration,
        pace: r.pace,
        run: r.run,
      })),
    }
  })
