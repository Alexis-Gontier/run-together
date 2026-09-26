import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"

export default async function CompareRightPanel() {
  const user = await getRequiredUser()
  return (
    <div className="p-4">
      <WeekSummaryCard userId={user.id} />
    </div>
  )
}
