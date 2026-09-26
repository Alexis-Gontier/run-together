import { HighlightsCard } from "@/components/ui/highlights-card"
import { RecentBadgesCard } from "@/components/ui/recent-badges-card"
import { getUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfileRightPanel({ params }: Props) {
  const { username } = await params
  const [user, currentUser] = await Promise.all([
    prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    }),
    getUser(),
  ])
  if (!user) return null

  return (
    <div className="space-y-4 p-4">
      <HighlightsCard userId={user.id} />
      <RecentBadgesCard userId={user.id} isOwn={currentUser?.id === user.id} />
    </div>
  )
}
