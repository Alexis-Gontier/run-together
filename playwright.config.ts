import { defineConfig, devices } from "@playwright/test"
import { E2E } from "./e2e/support/env"

/**
 * Tests e2e — contre un build de prod (`next build && next start`), comme le recommande Next.
 * Un seul utilisateur e2e partagé : les doublons (±2 min) et les « à confirmer » (±30 min)
 * dépendent de toutes ses courses, d'où un seul worker.
 */
// Pas 3000 : un `pnpm dev` qui tourne serait réutilisé, avec sa base et son vrai webhook.
const PORT = 3100
const baseURL = `http://localhost:${PORT}`

// Une fois, dans le processus principal (la config est rechargée par chaque worker).
if (!process.env.TEST_WORKER_INDEX) {
  console.log(`[e2e] base de données : ${E2E.dbHost} (${E2E.source})`)
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "on-first-retry",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: E2E.storageState },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "pnpm build && pnpm start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      // Les variables du processus priment sur `.env.local` / `.env` chargés par Next.
      DATABASE_URL: E2E.databaseUrl,
      NEXT_PUBLIC_APP_URL: baseURL,
      // Port fermé : l'envoi échoue tout de suite, `notify()` journalise sans faire échouer.
      DISCORD_WEBHOOK_URL: "http://127.0.0.1:9/",
      PORT: String(PORT),
    },
  },
})
