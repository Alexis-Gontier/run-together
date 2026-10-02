import { compareRoute, profileRoute, ROUTES } from "@/lib/constants/routes"
import {
  battleNotifications,
  deleteBattleNotifications,
  insertRun,
} from "./support/db"
import { E2E } from "./support/env"
import { expect, test } from "./support/fixtures"

test.describe("bataille /compare", () => {
  test.beforeEach(deleteBattleNotifications)
  test.afterEach(deleteBattleNotifications)

  test("compte les points, désigne le gagnant et publie le résultat", async ({
    page,
  }) => {
    // Moi : 15 km, 2 courses, 5'00"/km, 100 m D+, plus longue 10 km.
    await insertRun(E2E.username, {
      distance: 10_000,
      duration: 3000,
      elevation: 100,
      daysAgo: 2,
    })
    await insertRun(E2E.username, {
      distance: 5000,
      duration: 1500,
      daysAgo: 5,
    })
    // Rival : 12 km, 1 course, 5'50"/km, 50 m D+ — il ne gagne que la plus longue.
    await insertRun(E2E.rivalUsername, {
      distance: 12_000,
      duration: 4200,
      elevation: 50,
      daysAgo: 3,
    })

    await page.goto(compareRoute(E2E.rivalUsername))
    // Dans `main` : pendant le streaming, une copie du contenu existe encore hors du DOM visible.
    const main = page.getByRole("main")
    await expect(
      main.getByText("Tu remportes la bataille !", { exact: true }),
    ).toBeVisible()
    await expect(main.getByText("+1")).toHaveCount(5)

    // Le webhook e2e pointe vers un port fermé : l'envoi échoue mais est journalisé.
    await page
      .getByRole("button", { name: "Publier le résultat sur Discord" })
      .click()
    await expect(
      page.getByText("Discord est indisponible, réessaie plus tard."),
    ).toBeVisible()

    const [row] = await battleNotifications()
    expect(row.status).toBe("FAILED")
    expect(row.payload.embeds[0].title).toBe(
      `⚔️ Bataille : ${E2E.username} vs ${E2E.rivalUsername}`,
    )
    expect(row.payload.embeds[0].description).toBe(
      `**${E2E.username}** l'emporte sur 3 mois : **4 – 1**`,
    )
  })
})

test.describe("annonce photo de profil", () => {
  test.use({ seenAnnouncements: [] })

  test("s'affiche une fois puis se ferme pour de bon", async ({ page }) => {
    await page.goto(ROUTES.HOME)
    const dialog = page.getByRole("dialog", {
      name: "Nouveau : photo de profil et bannière",
    })
    await expect(dialog).toBeVisible()
    await dialog.getByRole("button", { name: "Plus tard" }).click()
    await expect(dialog).toBeHidden()

    await page.reload()
    await expect(page.getByRole("main")).toBeVisible()
    await expect(dialog).toBeHidden()
  })

  test("mène au profil", async ({ page }) => {
    await page.goto(ROUTES.HOME)
    await page.getByRole("link", { name: "Personnaliser mon profil" }).click()
    await expect(page).toHaveURL(profileRoute(E2E.username))
  })
})
