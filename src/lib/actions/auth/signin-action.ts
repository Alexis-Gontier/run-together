"use server"

import { actionClient } from "@/lib/actions/clients"
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { signInSchema } from "@/lib/schemas";

export const signInAction = actionClient
    .inputSchema(signInSchema)
    .action(async ({ parsedInput }) => {
        try {
            const result = await auth.api.signInUsername({
                body: {
                    username: parsedInput.username,
                    password: parsedInput.password,
                },
                headers: await headers(),
            });

            if (!result) {
                return {
                    success: false,
                    error: "Échec de la connexion",
                };
            }

            return {
                success: true,
                message: "Connexion réussie",
                redirectTo: "/dashboard",
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion",
            };
        }
    });