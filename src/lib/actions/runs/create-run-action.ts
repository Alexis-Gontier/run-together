"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma"
import { createRunSchema } from "@/lib/schemas/run-schema"
import { revalidatePath } from "next/cache"

export const createRunAction = authActionClient
    .inputSchema(createRunSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            // Calculer le pace (min/km) = duration (minutes) / distance (km)
            const pace = parsedInput.duration / parsedInput.distance

            const run = await prisma.run.create({
                data: {
                    userId: ctx.user.id,
                    date: parsedInput.date,
                    distance: parsedInput.distance,
                    duration: parsedInput.duration * 60, // Convertir minutes en secondes
                    pace: pace,
                    elevationGain: parsedInput.elevationGain || 0,
                    notes: parsedInput.notes || null,
                },
            })

            // Revalider la page runs pour afficher le nouveau run
            revalidatePath('/dashboard/runs')

            return {
                success: true,
                data: run,
                message: "Run created successfully!",
            }
        } catch (error) {
            console.error("Error creating run:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create run",
                data: null,
            }
        }
    })
