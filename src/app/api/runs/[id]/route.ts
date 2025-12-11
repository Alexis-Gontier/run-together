import { authRoute, RouteError } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { createRunSchema } from "@/lib/schemas/run-schema";
import { z } from "zod";

// Schema for route params
const paramsSchema = z.object({
  id: z.string().cuid(),
});

/**
 * GET /api/runs/[id]
 * Fetch a specific run by ID
 * Ensures the run belongs to the authenticated user
 */
export const GET = authRoute
  .params(paramsSchema)
  .handler(async (request, context) => {
    const { user } = context.ctx;
    const { id } = context.params;

    // Find run and verify ownership
    const run = await prisma.run.findUnique({
      where: { id },
    });

    if (!run) {
      throw new RouteError("Run not found", 404);
    }

    if (run.userId !== user.id) {
      throw new RouteError("Forbidden - You don't own this run", 403);
    }

    return {
      success: true,
      data: run,
    };
  });

/**
 * PATCH /api/runs/[id]
 * Update a specific run
 * Ensures the run belongs to the authenticated user
 */
export const PATCH = authRoute
  .params(paramsSchema)
  .body(createRunSchema.partial()) // All fields are optional for update
  .handler(async (request, context) => {
    const { user } = context.ctx;
    const { id } = context.params;
    const { date, distance, duration, elevationGain, notes } = context.body;

    // Find run and verify ownership
    const existingRun = await prisma.run.findUnique({
      where: { id },
    });

    if (!existingRun) {
      throw new RouteError("Run not found", 404);
    }

    if (existingRun.userId !== user.id) {
      throw new RouteError("Forbidden - You don't own this run", 403);
    }

    // Recalculate pace if distance or duration changed
    let pace = existingRun.pace;
    if (distance || duration) {
      const newDistance = distance ?? existingRun.distance;
      const newDuration = duration ?? existingRun.duration;
      pace = newDuration / newDistance / 60;
    }

    // Update run
    const updatedRun = await prisma.run.update({
      where: { id },
      data: {
        date,
        distance,
        duration,
        pace,
        elevationGain,
        notes,
      },
    });

    return {
      success: true,
      data: updatedRun,
      message: "Run updated successfully",
    };
  });

/**
 * DELETE /api/runs/[id]
 * Delete a specific run
 * Ensures the run belongs to the authenticated user
 */
export const DELETE = authRoute
  .params(paramsSchema)
  .handler(async (request, context) => {
    const { user } = context.ctx;
    const { id } = context.params;

    // Find run and verify ownership
    const run = await prisma.run.findUnique({
      where: { id },
    });

    if (!run) {
      throw new RouteError("Run not found", 404);
    }

    if (run.userId !== user.id) {
      throw new RouteError("Forbidden - You don't own this run", 403);
    }

    // Delete run
    await prisma.run.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Run deleted successfully",
    };
  });
