import { prisma } from "@/lib/db/prisma"

export default function page() {

  const data = prisma.test.findMany()

  return (
    <div>
      {JSON.stringify(data, null, 2)}
    </div>
  )
}
