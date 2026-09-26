import { HighlightsCard } from "@/components/ui/highlights-card"
import { prisma } from "@/lib/db/prisma"

type Props = {
  params: Promise<{ username: string }>
}

export default async function ProfileRightPanel({ params }: Props) {
  const { username } = await params
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  })
  if (!user) return null

  return (
    <div className="p-4">
      <HighlightsCard userId={user.id} />
    </div>
  )
}
