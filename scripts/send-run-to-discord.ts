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
      user: { select: { name: true } },
    },
  })

  if (!run) {
    console.error(`Aucune course trouvée avec l'ID : ${runId}`)
    process.exit(1)
  }

  const userName = run.user.name ?? "Inconnu"
  const runName = run.name || "Course sans nom"
  const runUrl = `${APP_URL}/runs/${run.id}`

  const embed = {
    color: 0xfc4c02,
    author: { name: userName },
    title: runName,
    url: runUrl,
    description: `**${userName}** vient de terminer une course !`,
    image: { url: `${APP_URL}/api/og/run/${run.id}` },
  }

  // Fetch the OG image from the local server and attach it directly so
  // Discord can display it even when APP_URL is localhost.
  const ogUrl = `${APP_URL}/api/og/run/${run.id}`
  const ogRes = await fetch(ogUrl)
  if (!ogRes.ok) {
    console.error(
      `Impossible de générer l'OG image (${ogRes.status}): ${ogUrl}`,
    )
    console.error("Assure-toi que le serveur dev tourne (pnpm dev)")
    process.exit(1)
  }
  const ogBuffer = await ogRes.arrayBuffer()

  const form = new FormData()
  form.append(
    "payload_json",
    JSON.stringify({
      embeds: [{ ...embed, image: { url: "attachment://og.png" } }],
    }),
  )
  form.append("files[0]", new Blob([ogBuffer], { type: "image/png" }), "og.png")

  const res = await fetch(DISCORD_WEBHOOK_URL as string, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    console.error(`Erreur Discord (${res.status}): ${await res.text()}`)
    process.exit(1)
  }

  console.log(
    `Notification envoyée pour "${runName}" par ${userName} → ${runUrl}`,
  )
  await prisma.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await prisma.$disconnect()
  process.exit(1)
})
