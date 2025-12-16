import { authRoute } from "@/lib/routes/route";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

/**
 * GET /api/users
 * Fetch all users (excluding current user)
 * Optional query params: limit, search
 */
export const GET = authRoute
  .query(
    z.object({
      limit: z.coerce.number().positive().optional(),
      search: z.string().optional(),
    })
  )
  .handler(async (request, context) => {
    const { user: currentUser } = context.ctx;
    const { limit = 50, search } = context.query;

    // Build where clause
    const where: any = {};

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch users with their run count
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        username: true,
        displayUsername: true,
        email: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            runs: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      username: user.username || user.displayUsername,
      email: user.email,
      image: user.image,
      totalRuns: user._count.runs,
      createdAt: user.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedUsers,
      meta: {
        total: formattedUsers.length,
        limit,
      },
    };
  });
