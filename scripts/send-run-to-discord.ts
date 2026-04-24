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
if (!DATABASE_URL) throw new Error("DATABASE_URL manquant dans .env")
if (!DISCORD_WEBHOOK_URL)
  throw new Error("DISCORD_WEBHOOK_URL manquant dans .env")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

async function main() {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: {
      user: { select: { name: true } },
      splits: { orderBy: { kilometer: "asc" } },
    },
  })

  if (!run) {
    console.error(`Aucune course trouvée avec l'ID : ${runId}`)
    process.exit(1)
  }

  const json = JSON.stringify(run, null, 2)
  console.log(json)

  // Exclure les polylines pour rester sous la limite Discord de 2000 caractères
  const discordJson = JSON.stringify(
    run,
    (key, value) =>
      key === "summaryPolyline" || key === "polyline" ? undefined : value,
    2,
  )

  const res = await fetch(DISCORD_WEBHOOK_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: `\`\`\`json\n${discordJson}\n\`\`\`` }),
  })

  if (!res.ok) {
    console.error(`Erreur Discord (${res.status}): ${await res.text()}`)
    process.exit(1)
  }

  console.log(`✓ Données envoyées sur Discord`)
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
