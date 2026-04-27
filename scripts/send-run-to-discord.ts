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
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

if (!DATABASE_URL) throw new Error("DATABASE_URL manquant dans .env")
if (!DISCORD_WEBHOOK_URL)
  throw new Error("DISCORD_WEBHOOK_URL manquant dans .env")

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
})

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

function formatPace(paceSecondsPerKm: number): string {
  const m = Math.floor(paceSecondsPerKm / 60)
  const s = paceSecondsPerKm % 60
  return `${m}:${String(s).padStart(2, "0")}/km`
}

async function main() {
  const run = await prisma.run.findUnique({
    where: { id: runId },
    include: { user: { select: { name: true } } },
  })

  if (!run) {
    console.error(`Aucune course trouvée avec l'ID : ${runId}`)
    process.exit(1)
  }

  const km = (run.distance / 1000).toFixed(2)
  const duration = formatDuration(run.duration)
  const pace = formatPace(run.pace)
  const runUrl = `${APP_URL}/runs/${run.id}`

  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: "Distance", value: `${km} km`, inline: true },
    { name: "Durée", value: duration, inline: true },
    { name: "Allure", value: pace, inline: true },
    { name: "Dénivelé", value: `+${run.elevation} m`, inline: true },
  ]

  if (run.heartRateAvg) {
    fields.push({
      name: "Fréquence cardiaque",
      value: `♥ ${run.heartRateAvg} bpm`,
      inline: true,
    })
  }

  const embed: Record<string, unknown> = {
    color: 0xfc4c02,
    author: { name: run.user.name ?? "Inconnu" },
    title: run.name || "Course sans nom",
    url: runUrl,
    description: `**${run.user.name ?? "Inconnu"}** vient de terminer une course !`,
    fields,
  }

  if (run.summaryPolyline && MAPBOX_TOKEN) {
    embed.image = {
      url: `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/path-2+FC4C02(${encodeURIComponent(run.summaryPolyline)})/auto/600x300@2x?access_token=${MAPBOX_TOKEN}&padding=40,40,40,40`,
    }
  } else if (!MAPBOX_TOKEN) {
    console.warn("NEXT_PUBLIC_MAPBOX_TOKEN manquant — pas de carte")
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
