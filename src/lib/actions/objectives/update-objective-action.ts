"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updateObjectiveSchema = z.object({
    monthObjectif: z.number().min(0).max(1000).nullable(),
});

export const updateObjectiveAction = authActionClient
    .inputSchema(updateObjectiveSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            await prisma.user.update({
                where: {
                    id: ctx.user.id,
                },
                data: {
                    monthObjectif: parsedInput.monthObjectif,
                },
            });

            revalidatePath("/dashboard");
            revalidatePath("/dashboard/settings");

            return {
                success: true,
                message: "Objectif mis à jour avec succès",
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la mise à jour de l'objectif",
            };
        }
    });
