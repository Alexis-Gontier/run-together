"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";

const getCachedBmis = (userId: string) =>
    unstable_cache(
        async (userId: string) => {
            return prisma.bmi.findMany({
                where: {
                    userId,
                },
                orderBy: {
                    date: 'desc',
                },
            })
        },
        [`bmi-list`],
        {
            tags: [`bmi-${userId}`],
            revalidate: 600, // 10 minutes
        }
    )(userId);

export const getBmisAction = authActionClient
    .action(async ({ ctx }) => {
        try {
            const bmis = await getCachedBmis(ctx.user.id);
            return {
                success: true,
                data: bmis,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la récupération des IMC",
                data: null,
            };
        }
    });