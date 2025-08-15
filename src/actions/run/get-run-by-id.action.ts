"use server"

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth-server";
import { Run } from "@prisma/client";

export async function getRunById(id: string) {
    const user = await getUser();
    if (!user) {
        notFound();
    }

    const run = await prisma.run.findUnique({
        where: {
            id: id,
            // userId: user.id,
        },
    });

    if (!run) {
        notFound();
    }

    return run as Run;
}