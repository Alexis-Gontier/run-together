import { authRoute } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

/**
 * GET /api/runs/leaderboard
 * Get the leaderboard of users ranked by their running statistics
 * Query params: period (7, 30, 90, 365, all), metric (distance, runs, pace)
 */
export const GET = authRoute
  .query(
    z.object({
      period: z.enum(["7", "30", "90", "365", "all"]).optional().default("30"),
      metric: z.enum(["distance", "runs", "pace"]).optional().default("distance"),
      limit: z.coerce.number().positive().optional().default(10),
    })
  )
  .handler(async (request, context) => {
    const { user: currentUser } = context.ctx;
    const { period, metric, limit } = context.query;

    // Calculate date filter based on period
    const dateFilter: any = {};
    if (period !== "all") {
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter.gte = startDate;
    }

    // Fetch all users with their runs in the period
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        image: true,
        runs: {
          where: {
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
          },
          select: {
            distance: true,
            duration: true,
            pace: true,
          },
        },
      },
    });

    // Calculate statistics for each user
    const usersWithStats = users.map((user) => {
      const totalRuns = user.runs.length;

      if (totalRuns === 0) {
        return {
          id: user.id,
          name: user.name,
          username: user.username || user.displayUsername,
          image: user.image,
          totalRuns: 0,
          totalDistance: 0,
          averagePace: 0,
          isCurrentUser: user.id === currentUser.id,
        };
      }

      const totalDistance = user.runs.reduce(
        (sum, run) => sum + run.distance,
        0
      );
      const averagePace =
        user.runs.reduce((sum, run) => sum + run.pace, 0) / totalRuns;

      return {
        id: user.id,
        name: user.name,
        username: user.username || user.displayUsername,
        image: user.image,
        totalRuns,
        totalDistance: Math.round(totalDistance * 100) / 100,
        averagePace: Math.round(averagePace * 100) / 100,
        isCurrentUser: user.id === currentUser.id,
      };
    });

    // Sort by the selected metric
    let sortedUsers = [...usersWithStats];
    switch (metric) {
      case "distance":
        sortedUsers.sort((a, b) => b.totalDistance - a.totalDistance);
        break;
      case "runs":
        sortedUsers.sort((a, b) => b.totalRuns - a.totalRuns);
        break;
      case "pace":
        // Lower pace is better (faster)
        sortedUsers.sort((a, b) => a.averagePace - b.averagePace);
        break;
    }

    // Add rank to each user
    const rankedUsers = sortedUsers.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    // Get top N users
    const topUsers = rankedUsers.slice(0, limit);

    // Find current user's position if not in top N
    const currentUserRank = rankedUsers.find(
      (u) => u.id === currentUser.id
    );

    return {
      success: true,
      data: {
        leaderboard: topUsers,
        currentUser: currentUserRank || null,
        totalUsers: rankedUsers.length,
        period,
        metric,
      },
    };
  });
