import { notFound } from "next/navigation"
import { RecentBadgesCard } from "@/components/ui/recent-badges-card"
import { getUser } from "@/lib/auth/auth-session"
import { profileImagesEnabled } from "@/lib/profile-images/store"
import { getProfileAction } from "./_actions/get-profile-action"
import { getProfileRunsAction } from "./_actions/get-profile-runs-action"
import { ProfileHeader } from "./_components/profile-header"
import { ProfileTabs } from "./_components/profile-tabs"

type ProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const [profileResult, currentUser, runsResult] = await Promise.all([
    getProfileAction({ username }),
    getUser(),
    getProfileRunsAction({ username, limit: 10 }),
  ])

  const profileUser = profileResult?.data?.user
  if (!profileUser) notFound()

  const isOwnProfile = currentUser?.username === username
  const initialRuns = runsResult?.data?.runs ?? []
  const initialNextCursor = runsResult?.data?.nextCursor ?? null
  const records = profileResult?.data?.records ?? []

  return (
    <>
      <ProfileHeader
        name={profileUser.name}
        username={profileUser.username ?? username}
        displayUsername={profileUser.displayUsername}
        image={profileUser.image}
        bannerImage={profileUser.bannerImage}
        isOwnProfile={isOwnProfile}
        canEditImages={isOwnProfile && profileImagesEnabled()}
        runsCount={profileUser.runsCount}
        totalDistance={profileUser.totalDistance}
      />
      {/* Le panneau droit est masqué sous lg : les badges remontent sous l'en-tête. */}
      <div className="px-4 pb-4 lg:hidden">
        <RecentBadgesCard userId={profileUser.id} isOwn={isOwnProfile} />
      </div>
      <ProfileTabs
        username={profileUser.username ?? username}
        initialRuns={initialRuns}
        initialNextCursor={initialNextCursor}
        records={records}
      />
    </>
  )
}
