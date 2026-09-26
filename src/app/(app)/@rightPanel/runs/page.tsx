import { MilestoneCard } from "@/components/ui/milestone-card"
import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"

export default async function RunsRightPanel() {
  const user = await getRequiredUser()
  return (
    <div className="space-y-4 p-4">
      <WeekSummaryCard userId={user.id} />
      <MilestoneCard userId={user.id} />
    </div>
  )
}
