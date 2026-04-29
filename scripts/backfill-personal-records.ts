import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, PRDistance } from "../src/generated/prisma/client"

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error("DATABASE_URL manquant dans .env")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

const PR_CONFIG: Record<
  PRDistance,
  { meters: number; splitWindow: number | null }
> = {
  KM_1: { meters: 1000, splitWindow: 1 },
  KM_5: { meters: 5000, splitWindow: 5 },
  KM_10: { meters: 10000, splitWindow: 10 },
  HALF_MARATHON: { meters: 21097.5, splitWindow: null },
  MARATHON: { meters: 42195, splitWindow: null },
}

type RunForPR = { id: string; distance: number; duration: number; pace: number }
type SplitForPR = {
  kilometer: number
  distance: number
  duration: number
  pace: number
}

function extractCandidates(
  run: RunForPR,
  splits: SplitForPR[],
): { distance: PRDistance; runId: string; duration: number; pace: number }[] {
  const results: {
    distance: PRDistance
    runId: string
    duration: number
    pace: number
  }[] = []
  const sorted = [...splits].sort((a, b) => a.kilometer - b.kilometer)

  for (const [key, config] of Object.entries(PR_CONFIG) as [
    PRDistance,
    (typeof PR_CONFIG)[PRDistance],
  ][]) {
    if (config.splitWindow !== null) {
      const w = config.splitWindow
      if (sorted.length < w) continue

      let bestDuration: number | null = null
      let bestPace: number | null = null

      for (let i = 0; i <= sorted.length - w; i++) {
        const window = sorted.slice(i, i + w)
        const totalDuration = window.reduce((s, sp) => s + sp.duration, 0)
        const totalDistance = window.reduce((s, sp) => s + sp.distance, 0)
        if (totalDistance < config.meters * 0.9) continue
        if (bestDuration === null || totalDuration < bestDuration) {
          bestDuration = totalDuration
          bestPace = Math.round((totalDuration / totalDistance) * 1000)
        }
      }

      if (bestDuration !== null && bestPace !== null) {
        results.push({
          distance: key,
          runId: run.id,
          duration: bestDuration,
          pace: bestPace,
        })
      }
    } else {
      if (run.distance < config.meters * 0.97) continue
      results.push({
        distance: key,
        runId: run.id,
        duration: run.duration,
        pace: run.pace,
      })
    }
  }

  return results
}

async function recalculateForUser(userId: string): Promise<number> {
  const runs = await prisma.run.findMany({
    where: { userId },
    select: {
      id: true,
      distance: true,
      duration: true,
      pace: true,
      splits: {
        select: { kilometer: true, distance: true, duration: true, pace: true },
        orderBy: { kilometer: "asc" },
      },
    },
  })

  const best = new Map<
    PRDistance,
    { runId: string; duration: number; pace: number }
  >()

  for (const run of runs) {
    for (const c of extractCandidates(run, run.splits)) {
      const current = best.get(c.distance)
      if (!current || c.duration < current.duration) {
        best.set(c.distance, {
          runId: c.runId,
          duration: c.duration,
          pace: c.pace,
        })
      }
    }
  }

  await prisma.personalRecord.deleteMany({ where: { userId } })

  if (best.size === 0) return 0

  await prisma.personalRecord.createMany({
    data: Array.from(best.entries()).map(([distance, c]) => ({
      userId,
      runId: c.runId,
      distance,
      duration: c.duration,
      pace: c.pace,
    })),
  })

  return best.size
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, _count: { select: { runs: true } } },
    orderBy: { createdAt: "asc" },
  })

  console.log(`Backfill des personal records pour ${users.length} user(s)...\n`)

  let total = 0
  for (const user of users) {
    const count = await recalculateForUser(user.id)
    console.log(
      `  ${user.name ?? user.id} — ${user._count.runs} run(s) → ${count} PR(s)`,
    )
    total += count
  }

  console.log(`\nTerminé. ${total} PR(s) créés au total.`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
