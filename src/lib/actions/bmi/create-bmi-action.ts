"use server"

import { authActionClient } from "@/lib/actions/clients"
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import {
    bmiCreateSchema,
} from "@/lib/schemas/bmi-schema";

export const healthMetricsCreateAction = authActionClient
    .inputSchema(bmiCreateSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const bmi = await prisma.bmi.create({
                data: {
                    userId: ctx.user.id,
                    weight: parsedInput.weight,
                    height: parsedInput.height,
                    date: parsedInput.date,
                }
            });
            revalidatePath("/dashboard/bmi");
            revalidateTag(`bmi-${ctx.user.id}`, 'default');
            return {
                success: true,
                data: bmi,
                message: "IMC créé avec succès",
            };
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Échec de la création de l'IMC",
                data: null,
            };
        }
    });