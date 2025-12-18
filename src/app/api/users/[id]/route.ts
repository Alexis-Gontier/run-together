import { authRoute, RouteError } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const paramsSchema = z.object({
  id: z.string(),
});

/**
 * GET /api/users/[id]
 * Fetch a specific user by ID with their stats
 */
export const GET = authRoute
  .params(paramsSchema)
  .handler(async (request, context) => {
    const { id } = context.params;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        email: true,
        image: true,
        createdAt: true,
        monthObjectif: true,
      },
    });

    if (!user) {
      throw new RouteError("User not found", 404);
    }

    // Get current month start and last month boundaries
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get all runs for stats
    const runs = await prisma.run.findMany({
      where: { userId: id },
      select: {
        distance: true,
        duration: true,
        pace: true,
        elevationGain: true,
        date: true,
      },
    });

    // Calculate stats
    const totalRuns = runs.length;
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);
    const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0);
    const totalElevation = runs.reduce((sum, run) => sum + run.elevationGain, 0);
    const averagePace = totalRuns > 0 ? totalDuration / totalDistance / 60 : 0;
    const longestRun = runs.length > 0 ? Math.max(...runs.map((r) => r.distance)) : 0;
    const fastestPace = runs.length > 0 ? Math.min(...runs.map((r) => r.pace)) : 0;

    // Current month stats
    const currentMonthRuns = runs.filter((run) => run.date >= currentMonthStart);
    const currentMonthRunsCount = currentMonthRuns.length;
    const currentMonthDistance = currentMonthRuns.reduce(
      (sum, run) => sum + run.distance,
      0
    );

    // Last month stats
    const lastMonthRuns = runs.filter(
      (run) => run.date >= lastMonthStart && run.date <= lastMonthEnd
    );
    const lastMonthDistance = lastMonthRuns.reduce(
      (sum, run) => sum + run.distance,
      0
    );

    return {
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        stats: {
          totalRuns,
          totalDistance,
          totalDuration,
          averagePace,
          totalElevation,
          longestRun,
          fastestPace,
          currentMonthRuns: currentMonthRunsCount,
          currentMonthDistance,
          lastMonthDistance,
        },
      },
    };
  });
