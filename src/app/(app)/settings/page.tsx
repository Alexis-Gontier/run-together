import { getRequiredUser } from "@/lib/auth/auth-session"
import { getStravaConnectionAction } from "./_actions/get-strava-connection-action"
import { AccountCard } from "./_components/account-card"
import { DangerZoneCard } from "./_components/danger-zone-card"
import { PreferencesCard } from "./_components/preferences-card"
import { ProfileCard } from "./_components/profile-card"
import { StravaCard } from "./_components/strava-card"
import { WeeklyGoalCard } from "./_components/weekly-goal-card"

export default async function SettingsPage() {
  const [user, stravaResult] = await Promise.all([
    getRequiredUser(),
    getStravaConnectionAction(),
  ])

  const stravaAccount = stravaResult?.data?.stravaAccount ?? null

  return (
    <div className="space-y-6 p-6">
      <ProfileCard
        name={user.name}
        email={user.email}
        username={user.username}
        image={user.image}
      />
      <StravaCard connection={stravaAccount} />
      <PreferencesCard />
      <WeeklyGoalCard />
      <AccountCard />
      <DangerZoneCard />
    </div>
  )
}
