"use server"

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth-server";

type GetRunsParams = {
  page?: number;
  pageSize?: number;
};

export async function getRuns(params: GetRunsParams = {}) {
    const user = await getUser();
    if (!user) {
        notFound();
    }

    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;

    // Récupération des runs avec pagination
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
        skip,
        take: pageSize,
    });

    // Comptage total des runs pour la pagination
    const totalRuns = await prisma.run.count({
        where: {
            userId: user.id,
        },
    });

    return {
        runs,
        totalRuns,
        currentPage: page,
        pageSize,
    };
}