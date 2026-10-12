import { PanelCard } from "@/components/ui/panel-card"
import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"

export default async function ChartsRightPanel() {
  const user = await getRequiredUser()
  return (
    <div className="space-y-4 p-4">
      <PanelCard title="Comment lire les radars">
        <p className="text-muted-foreground text-sm">
          Chaque axe est relatif au meilleur du groupe sur la période : le
          meilleur touche le bord. La note sur 100 est l&apos;aire du radar, et
          sert au classement. Choisis les axes avec « Stats ».
        </p>
      </PanelCard>
      <WeekSummaryCard userId={user.id} />
    </div>
  )
}
