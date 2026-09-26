import { format } from "date-fns"
import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"

/** Export JSON de toutes les données de l'utilisateur connecté (paramètres → Exporter). */
export async function GET() {
  const user = await getUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      name: true,
      username: true,
      email: true,
      createdAt: true,
      publishRunsToDiscord: true,
      personalRecords: {
        select: { distance: true, duration: true, pace: true, runId: true },
      },
      runs: {
        orderBy: { date: "asc" },
        omit: { userId: true },
        include: {
          splits: {
            orderBy: { kilometer: "asc" },
            omit: { id: true, runId: true },
          },
        },
      },
    },
  })

  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), version: 1, ...data },
    null,
    2,
  )
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="run-together-${user.username ?? "export"}-${format(new Date(), "yyyy-MM-dd")}.json"`,
    },
  })
}
