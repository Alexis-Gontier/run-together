"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const deleteRunSchema = z.object({
    id: z.string(),
})

export const deleteRunAction = authActionClient
    .inputSchema(deleteRunSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            // Verify the run belongs to the user before deleting
            const run = await prisma.run.findFirst({
                where: {
                    id: parsedInput.id,
                    userId: ctx.user.id,
                },
            })

            if (!run) {
                return {
                    success: false,
                    error: "Run not found or you don't have permission to delete it",
                    data: null,
                }
            }

            await prisma.run.delete({
                where: {
                    id: parsedInput.id,
                },
            })

            // Revalidate the runs page to reflect the deletion
            revalidatePath('/dashboard/runs')

            return {
                success: true,
                data: null,
                message: "Run deleted successfully!",
            }
        } catch (error) {
            console.error("Error deleting run:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to delete run",
                data: null,
            }
        }
    })
