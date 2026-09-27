import { ADMIN_ROUTES, profileRoute, ROUTES } from "@/lib/constants/routes"
import { E2E } from "./support/env"
import { expect, test } from "./support/fixtures"

const PAGES = [
  ["accueil", ROUTES.HOME],
  ["mes courses", ROUTES.RUNS],
  ["progression", ROUTES.PROGRESS],
  ["classement", ROUTES.LEADERBOARD],
  ["badges", ROUTES.BADGES],
  ["comparer", ROUTES.COMPARE],
  ["profil", profileRoute(E2E.username)],
] as const

test.describe("pages principales", () => {
  for (const [name, path] of PAGES) {
    test(`${name} s'affiche sans erreur`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBeLessThan(400)
      await expect(page).toHaveURL(path)
      await expect(page.getByRole("main")).toBeVisible()
      await expect(page.getByText("500 - Internal Server Error")).toBeHidden()
    })
  }
})

// Pas d'assertion sur le statut HTTP : `app/loading.tsx` fait streamer la réponse, le 200 est
// envoyé avant que le layout admin n'appelle `forbidden()`.
test("un utilisateur non admin est refusé sur /admin", async ({ page }) => {
  await page.goto(ADMIN_ROUTES.USERS)
  await expect(page).toHaveURL(ADMIN_ROUTES.USERS)
  await expect(page.getByText("Accès interdit")).toBeVisible()
  await expect(page.getByText("Administration")).toBeHidden()
})
