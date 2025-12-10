"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma";

export const getBmisAction = authActionClient
    .action(async ({ ctx }) => {
        try {
            const bmis = await prisma.bmi.findMany({
                where: {
                    userId: ctx.user.id,
                },
                orderBy: {
                    date: 'desc',
                },
            })
            return {
                success: true,
                data: bmis,
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch bmis",
                data: null,
            };
        }
    });