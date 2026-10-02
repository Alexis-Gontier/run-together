import { join } from "node:path"
import { test as base, expect, type Page } from "@playwright/test"
import { resetE2eRuns } from "./db"
import { E2E } from "./env"

// PNG transparent 1×1 : remplace les tuiles Esri des miniatures.
const BLANK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
)
// Style MapLibre vide : la carte détaillée se monte sans aucune tuile CARTO.
const EMPTY_STYLE = { version: 8, sources: {}, layers: [] }
const MAPLIBRE_WORKER = join(
  __dirname,
  "../../node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs",
)

type Fixtures = {
  /** Annonces marquées vues (`test.use({ seenAnnouncements: [] })` pour les voir). */
  seenAnnouncements: string[]
  /** Erreurs console et exceptions de la page ; le test échoue s'il en reste à la fin. */
  consoleErrors: string[]
  /** Chemin d'un fichier de `e2e/fixtures/files/`. */
  fixtureFile: (path: string) => string
}

// Fixtures automatiques sans valeur : `void` est le type attendu par Playwright.
type AutoFixtures = {
  // biome-ignore lint/suspicious/noConfusingVoidType: convention Playwright
  blockExternal: void
  // biome-ignore lint/suspicious/noConfusingVoidType: convention Playwright
  cleanRuns: void
  // biome-ignore lint/suspicious/noConfusingVoidType: convention Playwright
  skipAnnouncements: void
}

// Annonces de nouveautés (`AnnouncementDialog`) : marquées vues, sinon la modale bloque les clics.
const SEEN_ANNOUNCEMENTS = ["profile-images-v1"]

export const test = base.extend<Fixtures & AutoFixtures>({
  // Aucun appel réseau hors de l'app : tuiles de carte bouchonnées, le reste répond vide.
  blockExternal: [
    async ({ context }, use) => {
      await context.route(
        (url) => url.hostname !== "localhost",
        (route) => route.fulfill({ status: 204 }),
      )
      await context.route(/services\.arcgisonline\.com/, (route) =>
        route.fulfill({ contentType: "image/png", body: BLANK_PNG }),
      )
      await context.route(/basemaps\.cartocdn\.com\/.*style\.json/, (route) =>
        route.fulfill({ json: EMPTY_STYLE }),
      )
      // `map.tsx` charge le worker MapLibre depuis unpkg : servi depuis node_modules.
      await context.route(/unpkg\.com\/maplibre-gl@.*-worker\.mjs/, (route) =>
        route.fulfill({
          path: MAPLIBRE_WORKER,
          contentType: "text/javascript",
          headers: { "access-control-allow-origin": "*" },
        }),
      )
      await use()
    },
    { auto: true },
  ],

  seenAnnouncements: [SEEN_ANNOUNCEMENTS, { option: true }],

  skipAnnouncements: [
    async ({ context, seenAnnouncements }, use) => {
      await context.addInitScript((ids) => {
        for (const id of ids) localStorage.setItem(`announcement:${id}`, "e2e")
      }, seenAnnouncements)
      await use()
    },
    { auto: true },
  ],

  // Chaque test part d'un utilisateur e2e sans course, et n'en laisse aucune.
  cleanRuns: [
    // biome-ignore lint/correctness/noEmptyPattern: Playwright exige la déstructuration
    async ({}, use) => {
      await resetE2eRuns()
      await use()
      await resetE2eRuns()
    },
    { auto: true },
  ],

  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
      })
      page.on("pageerror", (err) => errors.push(err.message))
      await use(errors)
      expect(errors, "erreurs dans la console du navigateur").toEqual([])
    },
    { auto: true },
  ],

  // biome-ignore lint/correctness/noEmptyPattern: Playwright exige la déstructuration
  fixtureFile: async ({}, use) => {
    await use((path) => join(E2E.files, path))
  },
})

export { expect }

/** Importe un fichier depuis l'onglet « Importer un fichier » de `/runs/new`. */
export async function importSingleFile(page: Page, file: string) {
  await page.getByRole("tab", { name: "Importer un fichier" }).click()
  await page.getByLabel(/Glisse ton fichier/).setInputFiles(file)
}

/** Décoche « Publier sur Discord » (décoché par défaut pour l'utilisateur e2e, on s'en assure). */
export async function disableDiscord(page: Page) {
  const discord = page.getByRole("switch", { name: "Publier sur Discord" })
  await discord.setChecked(false)
  await expect(discord).not.toBeChecked()
}
