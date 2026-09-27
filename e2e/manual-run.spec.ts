import { ROUTES } from "@/lib/constants/routes"
import { disableDiscord, expect, test } from "./support/fixtures"

test("saisie manuelle : créer, retrouver puis supprimer une course", async ({
  page,
}) => {
  const name = "Saisie manuelle e2e"

  await page.goto(ROUTES.RUN_NEW)
  // Date et heure par défaut : maintenant.
  await page.getByLabel("Nom", { exact: true }).fill(name)
  await page.getByLabel("Distance").fill("10")
  await page.getByLabel("Minutes").fill("50")
  await expect(page.getByText("5'00\" /km")).toBeVisible()
  await disableDiscord(page)
  await page.getByRole("button", { name: "Enregistrer" }).click()

  await expect(page).toHaveURL(/\/runs\/[^/]+$/)
  await expect(page.getByText(name).first()).toBeVisible()

  await page.goto(ROUTES.RUNS)
  // Les mois sont repliés : on déplie le seul qui contient une course.
  await page.getByRole("button", { name: /1 courses/ }).click()
  const link = page.getByRole("link", { name: new RegExp(name) })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/\/runs\/[^/]+$/)

  await page.getByRole("button", { name: "Supprimer" }).click()
  const dialog = page.getByRole("alertdialog", {
    name: "Supprimer la course ?",
  })
  await dialog.getByRole("button", { name: "Supprimer" }).click()

  await expect(page).toHaveURL(ROUTES.RUNS)
  await expect(page.getByText("Course supprimée.")).toBeVisible()
  await expect(page.getByRole("link", { name: new RegExp(name) })).toHaveCount(
    0,
  )
})
