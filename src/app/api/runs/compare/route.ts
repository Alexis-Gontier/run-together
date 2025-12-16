import { authRoute } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

/**
 * GET /api/runs/compare
 * Compare running statistics between multiple users
 * Query params: userIds (comma-separated string), startDate (optional), endDate (optional)
 */
export const GET = authRoute
  .query(
    z.object({
      userIds: z.string().min(1).transform((val) => val.split(",")),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .handler(async (request, context) => {
    const { user: currentUser } = context.ctx;
    const { userIds, startDate, endDate } = context.query;

    // Validate that we have at least one user ID and max 10 for performance
    if (userIds.length === 0) {
      return {
        success: false,
        error: "At least one user ID is required",
        data: null,
      };
    }

    if (userIds.length > 10) {
      return {
        success: false,
        error: "Maximum 10 users can be compared at once",
        data: null,
      };
    }

    // Fetch users information (including current user if needed)
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        image: true,
      },
    });

    // Check if all requested users exist
    if (users.length !== userIds.length) {
      return {
        success: false,
        error: "Some users were not found",
        data: null,
      };
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date
      dateFilter.lte = end;
    }

    // Fetch runs for all selected users with optional date filter
    const runs = await prisma.run.findMany({
      where: {
        userId: {
          in: userIds,
        },
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      orderBy: {
        date: "desc",
      },
    });

    // Calculate statistics for each user
    const comparisons = await Promise.all(
      users.map(async (user) => {
        const userRuns = runs.filter((run) => run.userId === user.id);

        if (userRuns.length === 0) {
          return {
            user: {
              id: user.id,
              name: user.name,
              username: user.username || user.displayUsername,
              image: user.image,
            },
            stats: {
              totalRuns: 0,
              totalDistance: 0,
              totalDuration: 0,
              averageDistance: 0,
              averagePace: 0,
              averageDuration: 0,
              totalElevationGain: 0,
              lastRunDate: null,
              firstRunDate: null,
              runsPerMonth: 0,
              bestPace: null,
              longestRun: null,
            },
          };
        }

        // Calculate statistics
        const totalRuns = userRuns.length;
        const totalDistance = userRuns.reduce(
          (sum, run) => sum + run.distance,
          0
        );
        const totalDuration = userRuns.reduce(
          (sum, run) => sum + run.duration,
          0
        );
        const totalElevationGain = userRuns.reduce(
          (sum, run) => sum + run.elevationGain,
          0
        );

        const averageDistance = totalDistance / totalRuns;
        const averageDuration = totalDuration / totalRuns;
        const averagePace = userRuns.reduce((sum, run) => sum + run.pace, 0) / totalRuns;

        // Find date range
        const dates = userRuns.map((run) => new Date(run.date).getTime());
        const firstRunDate = new Date(Math.min(...dates));
        const lastRunDate = new Date(Math.max(...dates));

        // Calculate runs per month
        const monthsDiff =
          (lastRunDate.getTime() - firstRunDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30);
        const runsPerMonth = monthsDiff > 0 ? totalRuns / monthsDiff : totalRuns;

        // Find best pace and longest run
        const bestPace = Math.min(...userRuns.map((run) => run.pace));
        const longestRun = Math.max(...userRuns.map((run) => run.distance));

        return {
          user: {
            id: user.id,
            name: user.name,
            username: user.username || user.displayUsername,
            image: user.image,
          },
          stats: {
            totalRuns,
            totalDistance: Math.round(totalDistance * 100) / 100,
            totalDuration,
            averageDistance: Math.round(averageDistance * 100) / 100,
            averagePace: Math.round(averagePace * 100) / 100,
            averageDuration: Math.round(averageDuration),
            totalElevationGain: Math.round(totalElevationGain),
            lastRunDate: lastRunDate.toISOString(),
            firstRunDate: firstRunDate.toISOString(),
            runsPerMonth: Math.round(runsPerMonth * 10) / 10,
            bestPace: Math.round(bestPace * 100) / 100,
            longestRun: Math.round(longestRun * 100) / 100,
          },
        };
      })
    );

    return {
      success: true,
      data: {
        comparisons,
        comparedBy: {
          id: currentUser.id,
          name: currentUser.name,
        },
      },
    };
  });
