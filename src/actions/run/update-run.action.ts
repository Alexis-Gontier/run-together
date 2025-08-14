"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth-server";
import { UpdateRunData, updateRunSchema } from "@/schemas/run.schema";

export async function updateRun(runId: string, data: UpdateRunData) {
    const user = await getUser();
    if (!user) notFound();

    // Vérifier que la course appartient à l'utilisateur
    const existingRun = await prisma.run.findFirst({
        where: {
            id: runId,
            userId: user.id,
        },
    });

    if (!existingRun) {
        throw new Error("Course non trouvée ou vous n'avez pas l'autorisation de la modifier.");
    }

    const validatedData = updateRunSchema.parse(data);

    const updatedRun = await prisma.run.update({
        where: {
            id: runId,
        },
        data: {
            ...validatedData,
        },
    });

    revalidatePath("/dashboard/runs");

    return { success: true, run: updatedRun };
}