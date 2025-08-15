"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth-server";
import { CreateRunData, createRunSchema } from "@/schemas/run.schema";

export async function createRun(data: CreateRunData) {
    const user = await getUser();
    if (!user) notFound();

    const validatedData = createRunSchema.parse(data);

    const run = await prisma.run.create({
        data: {
            ...validatedData,
            userId: user.id,
        }
    });

    revalidatePath("/dashboard/runs/create");

    return run;
}