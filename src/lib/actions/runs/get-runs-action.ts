"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma"

export const getRunsAction = authActionClient
    .action(async ({ ctx }) => {
        try {
            const runs = await prisma.run.findMany({
                where: {
                    userId: ctx.user.id,
                },
                orderBy: {
                    date: 'desc',
                },
            })

            return {
                success: true,
                data: runs,
            }
        } catch (error) {
            console.error("Error fetching runs:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch runs",
                data: null,
            }
        }
    })
