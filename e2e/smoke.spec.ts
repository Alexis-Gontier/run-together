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

test("un utilisateur non admin est refusé sur /admin", async ({ page }) => {
  // Bug connu : `src/proxy.ts` redirige vers `/forbidden`, qui n'est pas une route
  // (`forbidden.tsx` n'est rendu que par `forbidden()`) → 404. À retirer une fois corrigé.
  test.fail()
  await page.goto(ADMIN_ROUTES.USERS)
  await expect(page.getByText("Accès interdit")).toBeVisible()
})
