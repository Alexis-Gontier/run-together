import type { Metadata } from "next"
import { prisma } from "@/lib/db/prisma"

type ProfileLayoutProps = {
  children: React.ReactNode
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: ProfileLayoutProps): Promise<Metadata> {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { name: true },
  })
  return { title: user?.name ?? username }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return children
}
