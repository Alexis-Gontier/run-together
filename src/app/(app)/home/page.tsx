import { DebugJson } from "@/components/ui/debug-json"
import { prisma } from "@/lib/db/prisma"

export default async function HomePage() {
  const data = await prisma.test.findMany()
  return <DebugJson data={data} />
}
