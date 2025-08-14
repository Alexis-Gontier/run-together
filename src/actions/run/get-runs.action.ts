"use server"

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth-server";
import { Run } from "@prisma/client";

export async function getRuns() {
    const user = await getUser();
    if (!user) {
        notFound();
    }

    const runs = await prisma.run.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            date: "desc",
        },
    });

    return runs as Run[];
}