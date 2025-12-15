import { authRoute } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

/**
 * GET /api/runs/recent
 * Get the most recent runs from all users
 * Query params: limit (default: 8)
 */
export const GET = authRoute
  .query(
    z.object({
      limit: z.coerce.number().positive().optional().default(8),
    })
  )
  .handler(async (request, context) => {
    const { limit } = context.query;

    // Fetch recent runs with user information
    const recentRuns = await prisma.run.findMany({
      take: limit,
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        date: true,
        distance: true,
        duration: true,
        pace: true,
        elevationGain: true,
        notes: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            displayUsername: true,
            image: true,
          },
        },
      },
    });

    // Format the response
    const formattedRuns = recentRuns.map((run) => ({
      id: run.id,
      date: run.date.toISOString(),
      distance: Math.round(run.distance * 100) / 100,
      duration: run.duration,
      pace: Math.round(run.pace * 100) / 100,
      elevationGain: Math.round(run.elevationGain),
      notes: run.notes,
      createdAt: run.createdAt.toISOString(),
      user: {
        id: run.user.id,
        name: run.user.name,
        username: run.user.username || run.user.displayUsername,
        image: run.user.image,
      },
    }));

    return {
      success: true,
      data: formattedRuns,
    };
  });
