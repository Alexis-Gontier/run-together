import { notFound } from "next/navigation"
import { getUser } from "@/lib/auth/auth-session"
import { getProfileAction } from "./_actions/get-profile-action"
import { ProfileHeader } from "./_components/profile-header"
import { ProfileTabs } from "./_components/profile-tabs"

type ProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const [profileResult, currentUser] = await Promise.all([
    getProfileAction({ username }),
    getUser(),
  ])

  const profileUser = profileResult?.data?.user
  if (!profileUser) notFound()

  const isOwnProfile = currentUser?.username === username

  return (
    <>
      <ProfileHeader
        name={profileUser.name}
        username={profileUser.username ?? username}
        displayUsername={profileUser.displayUsername}
        image={profileUser.image}
        createdAt={profileUser.createdAt}
        isOwnProfile={isOwnProfile}
      />
      <ProfileTabs />
    </>
  )
}
