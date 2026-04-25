import { NextRequest, NextResponse } from "next/server"

import { env } from "@/env"
import { prisma } from "@/lib/db/prisma"
import { importStravaActivity } from "@/lib/strava/import-activity"

// ---------------------------------------------------------------------------
// GET — Vérification d'abonnement (hub challenge)
// Strava appelle cet endpoint lors de la création de l'abonnement webhook
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const mode = searchParams.get("hub.mode")
  const verifyToken = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (
    mode !== "subscribe" ||
    verifyToken !== env.STRAVA_WEBHOOK_VERIFY_TOKEN ||
    !challenge
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ "hub.challenge": challenge })
}

// ---------------------------------------------------------------------------
// POST — Réception des événements Strava
// Strava envoie un événement pour chaque activité créée / modifiée / supprimée
// ---------------------------------------------------------------------------

interface StravaWebhookEvent {
  object_type: "activity" | "athlete"
  object_id: number
  aspect_type: "create" | "update" | "delete"
  owner_id: number
  subscription_id: number
  event_time: number
}

export async function POST(request: NextRequest) {
  let event: StravaWebhookEvent

  try {
    event = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (event.object_type !== "activity") {
    return NextResponse.json({ ok: true })
  }

  const stravaAccount = await prisma.stravaAccount.findUnique({
    where: { stravaAthleteId: String(event.owner_id) },
    select: { userId: true },
  })

  if (!stravaAccount) {
    // Athlete inconnu (ex : a déconnecté son compte) — on répond 200 pour éviter les retries Strava
    return NextResponse.json({ ok: true })
  }

  const { userId } = stravaAccount

  if (event.aspect_type === "create") {
    try {
      await importStravaActivity(userId, event.object_id)
    } catch (err) {
      console.error("[strava/webhook] import failed", event.object_id, err)
      // On renvoie 200 quand même : Strava retente sur 5xx
    }
  }

  if (event.aspect_type === "update") {
    try {
      await importStravaActivity(userId, event.object_id, {
        silent: true,
        replaceExisting: true,
      })
    } catch (err) {
      console.error("[strava/webhook] update failed", event.object_id, err)
    }
  }

  if (event.aspect_type === "delete") {
    await prisma.run.deleteMany({
      where: { stravaId: String(event.object_id), userId },
    })
  }

  return NextResponse.json({ ok: true })
}
