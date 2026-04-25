import { getRequiredUser } from "@/lib/auth/auth-session"
import { getRunsCountAction } from "./_actions/get-runs-count-action"
import { getStravaConnectionAction } from "./_actions/get-strava-connection-action"
import { getWebhookStatus } from "./_actions/get-webhook-status-action"
import { AccountCard } from "./_components/account-card"
import { DangerZoneCard } from "./_components/danger-zone-card"
import { PreferencesCard } from "./_components/preferences-card"
import { ProfileCard } from "./_components/profile-card"
import { StravaCard } from "./_components/strava-card"
import { WeeklyGoalCard } from "./_components/weekly-goal-card"

export default async function SettingsPage() {
  const [user, stravaResult, runsCountResult] = await Promise.all([
    getRequiredUser(),
    getStravaConnectionAction(),
    getRunsCountAction(),
  ])

  const stravaAccount = stravaResult?.data?.stravaAccount ?? null
  const webhookActive = stravaAccount ? await getWebhookStatus() : false
  const runsCount = runsCountResult?.data?.count ?? 0

  return (
    <div className="space-y-6 p-6">
      <ProfileCard
        name={user.name}
        email={user.email}
        username={user.username}
        image={user.image}
      />
      <StravaCard connection={stravaAccount} webhookActive={webhookActive} />
      <PreferencesCard />
      <WeeklyGoalCard />
      <AccountCard />
      <DangerZoneCard hasRuns={runsCount > 0} />
    </div>
  )
}
