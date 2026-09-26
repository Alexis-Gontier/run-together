import { MilestoneCard } from "@/components/ui/milestone-card"
import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"

export default async function BadgesRightPanel() {
  const user = await getRequiredUser()
  return (
    <div className="space-y-4 p-4">
      <MilestoneCard userId={user.id} />
      <WeekSummaryCard userId={user.id} />
    </div>
  )
}
