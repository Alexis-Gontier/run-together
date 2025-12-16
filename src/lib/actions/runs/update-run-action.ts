"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma"
import { createRunSchema } from "@/lib/schemas/run-schema"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateRunSchema = createRunSchema.extend({
    id: z.string(),
})

export const updateRunAction = authActionClient
    .inputSchema(updateRunSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const existingRun = await prisma.run.findFirst({
                where: {
                    id: parsedInput.id,
                    userId: ctx.user.id,
                },
            })

            if (!existingRun) {
                return {
                    success: false,
                    error: "Run non trouvé ou vous n'avez pas la permission de le mettre à jour",
                    data: null,
                }
            }

            // Calculate pace (min/km) = duration (minutes) / distance (km)
            const pace = parsedInput.duration / parsedInput.distance

            const run = await prisma.run.update({
                where: {
                    id: parsedInput.id,
                },
                data: {
                    date: parsedInput.date,
                    distance: parsedInput.distance,
                    duration: parsedInput.duration * 60, // Convert minutes to seconds
                    pace: pace,
                    elevationGain: parsedInput.elevationGain ?? 0,
                    notes: parsedInput.notes ?? null,
                },
            })

            // Revalidate the runs page to reflect the update
            revalidatePath('/dashboard/runs')

            return {
                success: true,
                data: run,
                message: "Run mis à jour avec succès!",
            }
        } catch (error) {
            console.error("Error updating run:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la mise à jour du run",
                data: null,
            }
        }
    })
