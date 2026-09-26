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
    select: { username: true, displayUsername: true },
  })
  return { title: user?.displayUsername ?? user?.username ?? username }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return children
}
