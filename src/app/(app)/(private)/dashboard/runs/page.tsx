import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { RunsPageContent } from '@/components/run/runs-page-content'

export default function RunsPage() {
  return (
    <>
      <DashboardTextHeading
        title="Courses"
        description="Gérez et suivez vos courses"
      />
      <RunsPageContent />
    </>
  )
}
