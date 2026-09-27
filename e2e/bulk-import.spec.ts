import type { Page } from "@playwright/test"
import { ROUTES } from "@/lib/constants/routes"
import { expect, test } from "./support/fixtures"

async function openBulk(page: Page) {
  await page.goto(ROUTES.RUN_NEW)
  await page.getByRole("tab", { name: "Plusieurs fichiers" }).click()
}

const filesInput = (page: Page) => page.getByLabel(/Glisse plusieurs fichiers/)
const finished = (page: Page) => page.getByText(/Import terminé/)
const row = (page: Page, name: string) =>
  page.getByRole("listitem").filter({ hasText: name })

test.describe("import en masse", () => {
  test("fichiers mélangés : importées, doublon, ignorée, erreur", async ({
    page,
    fixtureFile,
  }) => {
    await openBulk(page)
    await filesInput(page).setInputFiles(
      [
        "a.gpx",
        "a-copy.gpx",
        "b.gpx.gz",
        "ride.gpx",
        "broken.gpx",
        "notes.txt",
      ].map((f) => fixtureFile(`bulk/${f}`)),
    )

    await expect(finished(page)).toBeVisible()
    // Le .txt est écarté avant l'import : 5 lignes.
    await expect(page.getByText("Import terminé · 5/5")).toBeVisible()
    await expect(
      page.getByText(
        "2 importée(s) · 1 doublon(s) · 0 à confirmer · 1 ignorée(s) · 1 erreur(s)",
      ),
    ).toBeVisible()
    await expect(row(page, "a-copy.gpx")).toContainText("Déjà enregistrée")
    await expect(row(page, "ride.gpx")).toContainText(
      "Ignorée · Pas une course",
    )
    await expect(row(page, "broken.gpx")).toContainText("Fichier GPX invalide.")
    await expect(row(page, "notes.txt")).toHaveCount(0)
  })

  test("dossier d'archive Strava : titres repris, vélo ignoré", async ({
    page,
    fixtureFile,
  }) => {
    await openBulk(page)
    const chooser = page.waitForEvent("filechooser")
    await page
      .getByRole("button", { name: "Choisir le dossier de l'archive Strava" })
      .click()
    await (await chooser).setFiles(fixtureFile("strava-archive"))

    await expect(finished(page)).toBeVisible()
    await expect(
      page.getByText("activities.csv lu : 2 activités"),
    ).toBeVisible()
    await expect(row(page, "Sortie du dimanche")).toContainText("5.02 km")
    await expect(row(page, "Vélotaf")).toContainText("Ignorée · Ride")
    await expect(page.getByText("Titre du fichier")).toHaveCount(0)
  })

  test("une course proche d'une existante attend confirmation", async ({
    page,
    fixtureFile,
  }) => {
    await openBulk(page)
    await filesInput(page).setInputFiles(fixtureFile("nearby/first.gpx"))
    await expect(page.getByText(/1 importée\(s\)/)).toBeVisible()

    await filesInput(page).setInputFiles(fixtureFile("nearby/second.gpx"))
    const second = row(page, "second.gpx")
    await expect(second).toContainText("Proche de « Première e2e »")
    await expect(page.getByText(/1 à confirmer/)).toBeVisible()

    await second.getByRole("button", { name: "Importer" }).click()
    await expect(second).toContainText("5.96 km")
    await expect(
      page.getByText(/1 importée\(s\) · 0 doublon\(s\) · 0 à confirmer/),
    ).toBeVisible()
  })
})
