import { DashboardTextHeading } from '@/components/ui/dashboard-text-heading'
import { RunToolbar } from '@/components/run/run-toolbar'
import { RunTable } from '@/components/run/run-table'
import { getRunsAction } from '@/lib/actions'

export default async function RunsPage() {
  const result = await getRunsAction()

  const runs = result?.data?.data || []

  return (
    <>
      <DashboardTextHeading
        title="Runs"
        description="Manage and monitor your runs"
      />
      <RunToolbar />
      <RunTable runs={runs} />
    </>
  )
}
