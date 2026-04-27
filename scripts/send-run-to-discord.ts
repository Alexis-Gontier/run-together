import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const runId = process.argv[2]
if (!runId) {
  console.error("Usage: tsx scripts/send-run-to-discord.ts <run-id>")
  process.exit(1)
}

const DATABASE_URL = process.env.DATABASE_URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

if (!DATABASE_URL) throw new Error("DATABASE_URL manquant dans .env")
if (!DISCORD_WEBHOOK_URL)
  throw new Error("DISCORD_WEBHOOK_URL manquant dans .env")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

async function main() {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    select: {
      id: true,
      name: true,
      distance: true,
      user: { select: { name: true } },
    },
  })

  if (!run) {
    console.error(`Aucune course trouvée avec l'ID : ${runId}`)
    process.exit(1)
  }

  const km = (run.distance / 1000).toFixed(2)
  const runUrl = `${APP_URL}/runs/${run.id}`

  const embed = {
    color: 0xfc4c02,
    author: { name: run.user.name ?? "Inconnu" },
    title: run.name || "Course sans nom",
    url: runUrl,
    description: `**${run.user.name ?? "Inconnu"}** vient de terminer une course !`,
    image: { url: `${APP_URL}/api/og/run/${run.id}` },
  }

  const res = await fetch(DISCORD_WEBHOOK_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  })

  if (!res.ok) {
    console.error(`Erreur Discord (${res.status}): ${await res.text()}`)
    process.exit(1)
  }

  console.log(`Notification envoyée pour "${run.name}" (${km} km) → ${runUrl}`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
