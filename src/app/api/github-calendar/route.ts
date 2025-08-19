import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const runs = await prisma.run.findMany({
        where: { userId: user.id },
        select: {
            id: true,
            date: true
        },
        orderBy: { date: "desc" },
    });

    return NextResponse.json(runs);
}