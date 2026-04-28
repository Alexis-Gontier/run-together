"use server"

import { z } from "zod"
import { actionClient } from "@/lib/safe-action/action-client"
import { prisma } from "@/lib/db/prisma"

const schema = z.object({ username: z.string() })

export const getProfileAction = actionClient
  .inputSchema(schema)
  .action(async ({ parsedInput: { username } }) => {
    const [user, stats] = await Promise.all([
      prisma.user.findUnique({
        where: { username },
        select: {
          name: true,
          username: true,
          displayUsername: true,
          image: true,
          createdAt: true,
          _count: { select: { runs: true } },
        },
      }),
      prisma.run.aggregate({
        where: { user: { username } },
        _sum: { distance: true, elevation: true, duration: true },
        _avg: { pace: true },
      }),
    ])

    if (!user) return { user: null }

    return {
      user: {
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
        createdAt: user.createdAt,
        runsCount: user._count.runs,
        totalDistance: stats._sum.distance ?? 0,
        totalElevation: stats._sum.elevation ?? 0,
        totalDuration: stats._sum.duration ?? 0,
        avgPace: stats._avg.pace ?? 0,
      },
    }
  })
