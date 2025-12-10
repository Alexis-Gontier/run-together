"use server"

import { authActionClient } from "@/lib/actions/clients"
import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"
import {
    bmiDeleteSchema,
} from "@/lib/schemas/bmi-schema"

export const deleteBmiAction = authActionClient
    .inputSchema(bmiDeleteSchema)
    .action(async ({ parsedInput, ctx }) => {
        try {
            const bmi = await prisma.bmi.deleteMany({
                where: {
                    id: parsedInput.id,
                    userId: ctx.user.id,
                },
            })
            revalidatePath('/dashboard/bmi')
            return {
                success: true,
                data: bmi,
                message: "Bmi deleted successfully!",
            }
        } catch (error) {
            console.error("Error deleting bmi:", error)
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to delete bmi",
                data: null,
            }
        }
    })