"use server"

import { actionClient } from "@/lib/actions/clients"
import { changePasswordSchema } from "@/lib/schemas";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const changePasswordAction = actionClient
    .inputSchema(changePasswordSchema)
    .action(async ({ parsedInput }) => {
        try {
            const result = await auth.api.changePassword({
                body: {
                    currentPassword: parsedInput.currentPassword,
                    newPassword: parsedInput.newPassword,
                    revokeOtherSessions: parsedInput.revokeOtherSessions,
                },
                headers: await headers(),
            });

            if (!result) {
                return {
                    success: false,
                    error: "Échec du changement de mot de passe",
                };
            }

            // Revalider le layout du dashboard pour mettre à jour toutes les pages
            revalidatePath("/dashboard", "layout");

            return {
                success: true,
                message: "Mot de passe modifié avec succès",
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Une erreur est survenue lors du changement de mot de passe",
            };
        }
    });
