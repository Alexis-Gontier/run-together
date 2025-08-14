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
        select: {
            id: true,
            date: true,
            distance: true,
            duration: true,
            elevation: true,
            location: true,
            notes: true,
        },
    });

    return runs as Run[];
}