import { PublicHero } from "@/components/public-hero"
import { prisma } from "@/lib/db/prisma"

export default async function page() {

  const data = await prisma.test.findMany()

  return (
    <>
      <PublicHero />
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </>
  )
}
