import type { Metadata } from "next"
import { prisma } from "@/lib/db/prisma"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const run = await prisma.run.findUnique({
    where: { id },
    select: { name: true, user: { select: { name: true } } },
  })
  if (!run) return { title: "Course" }
  return { title: `${run.name ?? "Course"} · ${run.user.name}` }
}

export default function RunDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
