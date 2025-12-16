"use server"

import { actionClient } from "@/lib/actions/clients"
import { updateEmailSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const updateEmailAction = actionClient
    .inputSchema(updateEmailSchema)
    .action(async ({ parsedInput }) => {
        try {
            const result = await auth.api.changeEmail({
                body: {
                    newEmail: parsedInput.newEmail,
                },
                headers: await headers(),
            });

            if (!result) {
                return {
                    success: false,
                    error: "Échec de la mise à jour de l'email",
                };
            }

            revalidatePath("/dashboard", "layout");

            return {
                success: true,
                message: "Email mis à jour avec succès",
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour de l'email",
            };
        }
    });
