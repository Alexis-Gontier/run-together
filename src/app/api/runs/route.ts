import { authRoute } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { createRunSchema } from "@/lib/schemas/run-schema";
import { z } from "zod";

/**
 * GET /api/runs
 * Fetch all runs for the authenticated user
 * Optional query params: limit, offset
 */
export const GET = authRoute
  .query(
    z.object({
      limit: z.coerce.number().positive().optional(),
      offset: z.coerce.number().nonnegative().optional(),
    })
  )
  .handler(async (request, context) => {
    const { user } = context.ctx;
    const { limit = 50, offset = 0 } = context.query;

    // Fetch runs from database
    const runs = await prisma.run.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });

    // Count total runs for pagination
    const total = await prisma.run.count({
      where: { userId: user.id },
    });

    return {
      success: true,
      data: runs,
      meta: {
        total,
        limit,
        offset,
      },
    };
  });

/**
 * POST /api/runs
 * Create a new run for the authenticated user
 * Body: { date, distance, duration, elevationGain?, notes? }
 */
export const POST = authRoute
  .body(createRunSchema)
  .handler(async (request, context) => {
    const { user } = context.ctx;
    const { date, distance, duration, elevationGain, notes } = context.body;

    // Calculate pace (min/km)
    const pace = duration / distance / 60;

    // Create run in database
    const run = await prisma.run.create({
      data: {
        userId: user.id,
        date,
        distance,
        duration,
        pace,
        elevationGain: elevationGain ?? 0,
        notes,
      },
    });

    return {
      success: true,
      data: run,
      message: "Run created successfully",
    };
  });
