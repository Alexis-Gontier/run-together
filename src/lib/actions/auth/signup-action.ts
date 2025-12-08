"use server"

import { actionClient } from "@/lib/actions/clients"
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { signUpSchema } from "@/lib/schemas";

export const signUpAction = actionClient
    .inputSchema(signUpSchema)
    .action(async ({ parsedInput }) => {
        try {
            const result = await auth.api.signUpEmail({
                body: {
                    username: parsedInput.username,
                    name: parsedInput.name,
                    email: parsedInput.email,
                    password: parsedInput.password,
                },
                headers: await headers(),
            });

            if (!result) {
                return {
                    success: false,
                    error: "Failed to create account",
                };
            }

            return {
                success: true,
                message: "Account created successfully",
                redirectTo: "/signin",
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "An error occurred during signup",
            };
        }
    });