import { DebugJson } from "@/components/ui/debug-json"
import { prisma } from "@/lib/db/prisma"

export default async function HomePage() {
  const runs = await prisma.run.findMany()
  return <DebugJson data={runs} />
}
