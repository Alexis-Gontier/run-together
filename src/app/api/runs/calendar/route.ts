import { authRoute } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { format } from "date-fns";

/**
 * GET /api/runs/calendar
 * Fetch calendar data for runs (activity heatmap)
 * Query params: year (optional, defaults to current year)
 */
export const GET = authRoute
  .query(
    z.object({
      year: z.coerce.number().int().min(2020).max(2100).optional(),
    })
  )
  .handler(async (request, context) => {
    const { user } = context.ctx;
    const currentYear = new Date().getFullYear();
    const { year = currentYear } = context.query;

    // Fetch runs for the specified year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const runs = await prisma.run.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        id: true,
        date: true,
        distance: true,
        duration: true,
        pace: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // Transform runs into calendar format: Record<YYYY-MM-DD, CalendarDayData>
    const calendarData: Record<
      string,
      {
        hasActivity: boolean;
        runs: Array<{
          id: string;
          distance: number;
          duration: number;
          pace: number;
        }>;
      }
    > = {};

    runs.forEach((run) => {
      // Format date as YYYY-MM-DD in local timezone
      const dateKey = format(run.date, "yyyy-MM-dd");

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          hasActivity: true,
          runs: [],
        };
      }

      calendarData[dateKey].runs.push({
        id: run.id,
        distance: run.distance,
        duration: run.duration,
        pace: run.pace,
      });
    });

    // Count total runs for the year
    const totalRuns = runs.length;

    // Calculate total distance
    const totalDistance = runs.reduce((sum, run) => sum + run.distance, 0);

    // Calculate total duration in hours
    const totalDuration = runs.reduce((sum, run) => sum + run.duration, 0);
    const totalHours = Math.round(totalDuration / 3600);

    return {
      success: true,
      data: {
        calendar: calendarData,
        year,
        stats: {
          totalRuns,
          totalDistance: Math.round(totalDistance * 10) / 10, // Round to 1 decimal
          totalHours,
        },
      },
    };
  });
