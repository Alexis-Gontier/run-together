import { env } from "@/env"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { profileImagesEnabled } from "@/lib/profile-images/store"
import { getStravaConnectionAction } from "./_actions/get-strava-connection-action"
import { getWebhookStatus } from "./_actions/get-webhook-status-action"
import { AccountCard } from "./_components/account-card"
import { DangerZoneCard } from "./_components/danger-zone-card"
import { PreferencesCard } from "./_components/preferences-card"
import { ProfileCard } from "./_components/profile-card"
import { StravaCard } from "./_components/strava-card"
import { WeeklyGoalCard } from "./_components/weekly-goal-card"

export default async function SettingsPage() {
  const [user, stravaResult] = await Promise.all([
    getRequiredUser(),
    env.STRAVA_ENABLED ? getStravaConnectionAction() : null,
  ])

  const stravaAccount = stravaResult?.data?.stravaAccount ?? null
  const webhookActive = stravaAccount ? await getWebhookStatus() : false

  return (
    <div className="space-y-6 p-6">
      <ProfileCard
        name={user.name}
        email={user.email}
        username={user.username}
        image={user.image}
        bannerImage={user.bannerImage}
        canEditImages={profileImagesEnabled()}
      />
      {env.STRAVA_ENABLED && (
        <StravaCard connection={stravaAccount} webhookActive={webhookActive} />
      )}
      <PreferencesCard
        publishRunsToDiscord={user.publishRunsToDiscord ?? true}
      />
      <WeeklyGoalCard goalKm={user.weeklyGoalKm ?? null} />
      <AccountCard />
      <DangerZoneCard />
    </div>
  )
}
