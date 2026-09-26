import "dotenv/config"

// Diagnostic + gestion de l'abonnement webhook Strava.
//
//   pnpm strava:webhook            → liste les abonnements existants
//   pnpm strava:webhook create     → crée l'abonnement pour NEXT_PUBLIC_APP_URL
//   pnpm strava:webhook delete <id>→ supprime un abonnement

const API = "https://www.strava.com/api/v3/push_subscriptions"

const CLIENT_ID = process.env.STRAVA_CLIENT_ID
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET
const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

if (!CLIENT_ID || !CLIENT_SECRET)
  throw new Error("STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET manquants dans .env")

const creds = `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`

async function list() {
  const res = await fetch(`${API}?${creds}`)
  const body = await res.text()

  if (!res.ok) {
    console.error(`\n❌ Strava a répondu ${res.status} :\n${body}\n`)
    if (body.includes('"code":"Inactive"'))
      console.error(
        "→ L'application Strava est DÉSACTIVÉE (statut Inactive)." +
          "\n  Aucun appel API n'aboutira tant qu'elle n'est pas" +
          " réactivée sur https://www.strava.com/settings/api",
      )
    else console.error("→ Vérifie CLIENT_ID / CLIENT_SECRET.")
    process.exit(1)
  }

  const subs = JSON.parse(body) as {
    id: number
    callback_url: string
    created_at: string
    updated_at: string
  }[]

  if (subs.length === 0) {
    console.log("\n⚠️  Aucun abonnement webhook. Strava n'envoie rien à l'app.")
    console.log("→ Lance : pnpm strava:webhook create\n")
    return subs
  }

  const expected = `${APP_URL}/api/strava/webhook`
  console.log(`\n${subs.length} abonnement(s) :\n`)
  for (const s of subs) {
    const ok = s.callback_url === expected
    console.log(`  id           : ${s.id}`)
    console.log(`  callback_url : ${s.callback_url} ${ok ? "✅" : "❌"}`)
    console.log(`  créé le      : ${s.created_at}\n`)
    if (!ok)
      console.log(`  → Attendu : ${expected}\n    Supprime-le puis recrée.\n`)
  }
  return subs
}

async function create() {
  if (!APP_URL) throw new Error("NEXT_PUBLIC_APP_URL manquant dans .env")
  if (!VERIFY_TOKEN)
    throw new Error("STRAVA_WEBHOOK_VERIFY_TOKEN manquant dans .env")
  if (APP_URL.includes("localhost"))
    throw new Error(
      "NEXT_PUBLIC_APP_URL pointe sur localhost : Strava doit pouvoir " +
        "appeler l'URL publiquement pour valider l'abonnement.",
    )

  const callbackUrl = `${APP_URL}/api/strava/webhook`
  console.log(`\nCréation de l'abonnement → ${callbackUrl}`)
  console.log("(Strava va d'abord appeler cette URL en GET pour la valider)\n")

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      callback_url: callbackUrl,
      verify_token: VERIFY_TOKEN,
    }),
  })

  const body = await res.text()
  if (!res.ok) {
    console.error(`❌ Échec (${res.status}) :\n${body}\n`)
    console.error("Causes fréquentes :")
    console.error("  - l'URL n'est pas joignable publiquement (protection de")
    console.error("    déploiement Vercel active ?)")
    console.error("  - STRAVA_WEBHOOK_VERIFY_TOKEN diffère entre .env et prod")
    console.error("  - un abonnement existe déjà (Strava n'en autorise qu'un)")
    process.exit(1)
  }

  console.log(`✅ Abonnement créé :\n${body}\n`)
}

async function remove(id: string) {
  const res = await fetch(`${API}/${id}?${creds}`, { method: "DELETE" })
  if (!res.ok) {
    console.error(`❌ Échec (${res.status}) : ${await res.text()}`)
    process.exit(1)
  }
  console.log(`✅ Abonnement ${id} supprimé.`)
}

const [command, arg] = process.argv.slice(2)

async function main() {
  if (command === "create") return void (await create())
  if (command === "delete") {
    if (!arg) throw new Error("Usage : pnpm strava:webhook delete <id>")
    return void (await remove(arg))
  }
  await list()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
