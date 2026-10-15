import type { Page } from "@playwright/test"
import { ROUTES } from "@/lib/constants/routes"
import { dropInput, expect, test } from "./support/fixtures"

async function openBulk(page: Page) {
  await page.goto(ROUTES.RUN_NEW)
}

/** Dépose plusieurs fichiers ; après un premier import, repart de la zone de dépôt. */
async function importFiles(page: Page, files: string[]) {
  const restart = page.getByRole("button", { name: "Nouvel import" })
  if (await restart.isVisible()) await restart.click()
  await dropInput(page).setInputFiles(files)
}
const finished = (page: Page) => page.getByText(/Import terminé/)
const row = (page: Page, name: string) =>
  page.getByRole("listitem").filter({ hasText: name })

test.describe("import en masse", () => {
  test("fichiers mélangés : importées, doublon, ignorée, erreur", async ({
    page,
    fixtureFile,
  }) => {
    await openBulk(page)
    await importFiles(
      page,
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
    await page.getByRole("button", { name: /Dossier d'archive Strava/ }).click()
    await (await chooser).setFiles(fixtureFile("strava-archive"))

    await expect(finished(page)).toBeVisible()
    await expect(
      page.getByText("activities.csv lu : 2 activités"),
    ).toBeVisible()
    await expect(row(page, "Sortie du dimanche")).toContainText("5.02 km")
    await expect(row(page, "Vélotaf")).toContainText("Ignorée · Ride")
    await expect(page.getByText("Titre du fichier")).toHaveCount(0)
  })

  test("plusieurs courses à confirmer : ligne par ligne ou d'un coup", async ({
    page,
    fixtureFile,
  }) => {
    const existing = ["nearby/first.gpx", "nearby/third.gpx"].map(fixtureFile)
    const nearby = ["nearby/second.gpx", "nearby/fourth.gpx"].map(fixtureFile)
    await openBulk(page)
    await importFiles(page, existing)
    await expect(page.getByText(/2 importée\(s\)/)).toBeVisible()

    // Ligne par ligne : on garde l'existante pour l'une, on importe l'autre.
    await importFiles(page, nearby)
    await expect(page.getByText(/2 à confirmer/)).toBeVisible()
    await row(page, "second.gpx")
      .getByRole("button", { name: "Ignorer" })
      .click()
    await expect(row(page, "second.gpx")).toContainText("Existante gardée")
    await row(page, "fourth.gpx")
      .getByRole("button", { name: "Importer" })
      .click()
    await expect(
      page.getByText(
        /1 importée\(s\) · 0 doublon\(s\) · 0 à confirmer · 1 ignorée/,
      ),
    ).toBeVisible()

    // D'un coup : le fichier ignoré revient à confirmer, « Tout ignorer » puis « Tout importer ».
    await importFiles(page, nearby)
    await expect(page.getByText(/1 à confirmer/)).toBeVisible()
    await expect(row(page, "fourth.gpx")).toContainText("Déjà enregistrée")
    await page.getByRole("button", { name: "Tout ignorer" }).click()
    await expect(page.getByText(/0 à confirmer · 1 ignorée/)).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Tout ignorer" }),
    ).toHaveCount(0)

    await importFiles(page, nearby)
    await expect(page.getByText(/1 à confirmer/)).toBeVisible()
    await page.getByRole("button", { name: "Tout importer" }).click()
    await expect(row(page, "second.gpx")).toContainText("5.96 km")
    await expect(page.getByText(/1 importée\(s\) · 1 doublon/)).toBeVisible()
  })
})
