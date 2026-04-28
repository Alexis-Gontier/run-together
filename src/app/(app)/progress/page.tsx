import { notFound } from "next/navigation"
import { env } from "@/env"
import { DebugJson } from "@/components/ui/debug-json"
import { getProgressAction } from "./_actions/get-progress-action"
import type { ProgressPeriod } from "./_schemas/progress-schema"

type Props = {
  searchParams: Promise<{ period?: string }>
}

export default async function ProgressPage({ searchParams }: Props) {
  if (env.NODE_ENV === "production") notFound()

  const { period } = await searchParams
  const validPeriods: ProgressPeriod[] = ["3m", "6m", "1y", "all"]
  const selectedPeriod: ProgressPeriod = validPeriods.includes(
    period as ProgressPeriod,
  )
    ? (period as ProgressPeriod)
    : "3m"

  const result = await getProgressAction({ period: selectedPeriod })

  return <DebugJson data={result?.data} />
}
