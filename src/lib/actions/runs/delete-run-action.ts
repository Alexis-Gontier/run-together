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
            const run = await prisma.run.findFirst({
                where: {
                    id: parsedInput.id,
                    userId: ctx.user.id,
                },
            })

            if (!run) {
                return {
                    success: false,
                    error: "Run non trouvé ou vous n'avez pas la permission de le supprimer",
                    data: null,
                }
            }

            await prisma.run.delete({
                where: {
                    id: parsedInput.id,
                },
            })

            revalidatePath('/dashboard/runs')

            return {
                success: true,
                data: null,
                message: "Run supprimé avec succès",
            }
        } catch (error) {
            console.error("Error deleting run:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la suppression du run",
                data: null,
            }
        }
    })
