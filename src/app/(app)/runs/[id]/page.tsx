import { notFound } from "next/navigation"
import { DebugJson } from "@/components/ui/debug-json"
import { getRunAction } from "./_actions/get-run-action"

type RunDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { id } = await params
  const result = await getRunAction({ id })
  const run = result?.data

  if (!run) notFound()

  return <DebugJson data={run} />
}
