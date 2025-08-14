"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth-server";

export async function deleteRun(runId: string) {
    const user = await getUser();
    if (!user) notFound();

    const run = await prisma.run.findUnique({
        where: {
            id: runId,
            userId: user.id,
        }
    });
    if (!run) notFound();

    await prisma.run.delete({
        where: {
            id: runId
        }
    });

    revalidatePath("/dashboard/runs");
    redirect("/dashboard/runs");

    return run;
}