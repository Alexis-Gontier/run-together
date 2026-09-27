import { ROUTES } from "@/lib/constants/routes"
import {
  disableDiscord,
  expect,
  importSingleFile,
  test,
} from "./support/fixtures"

// Valeurs attendues : lues par le parseur de l'app sur les fichiers de `e2e/fixtures/`.
const FORMATS = [
  {
    file: "single/loop.gpx",
    name: "Boucle GPX e2e",
    date: "dim. 2 mars 2025",
    distance: "5.02",
    minutes: "27",
    seconds: "55",
    splits: 5,
  },
  {
    file: "single/loop.tcx",
    name: "",
    date: "dim. 9 mars 2025",
    distance: "5.34",
    minutes: "29",
    seconds: "40",
    splits: 6,
  },
  {
    file: "single/loop.fit",
    name: "",
    date: "dim. 16 mars 2025",
    distance: "5.66",
    minutes: "31",
    seconds: "25",
    splits: 6,
  },
] as const

test.describe("import d'un fichier", () => {
  for (const f of FORMATS) {
    const ext = f.file.split(".").pop()
    test(`${ext} : formulaire pré-rempli puis enregistrement`, async ({
      page,
      fixtureFile,
    }) => {
      await page.goto(ROUTES.RUN_NEW)
      await importSingleFile(page, fixtureFile(f.file))

      const fileName = f.file.split("/").pop() ?? ""
      await expect(
        page.getByText(`Données importées de ${fileName}`),
      ).toBeVisible()
      await expect(page.getByLabel("Nom")).toHaveValue(f.name)
      await expect(page.getByLabel("Date")).toHaveText(f.date)
      await expect(page.getByLabel("Heure de départ")).toHaveValue("08:00")
      await expect(page.getByLabel("Distance")).toHaveValue(f.distance)
      await expect(page.getByLabel("Heures")).toHaveValue("0")
      await expect(page.getByLabel("Minutes")).toHaveValue(f.minutes)
      await expect(page.getByLabel("Secondes")).toHaveValue(f.seconds)
      await expect(
        page.getByText(`Tracé GPS · ${f.splits} splits`),
      ).toBeVisible()

      await disableDiscord(page)
      await page.getByRole("button", { name: "Enregistrer" }).click()
      await expect(page).toHaveURL(/\/runs\/[^/]+$/)
      await expect(page.getByRole("heading", { name: "Course" })).toBeVisible()
      await expect(
        page.getByRole("main").getByText(f.distance, { exact: true }),
      ).toBeVisible()
    })
  }

  test("réimporter le même fichier est refusé comme doublon", async ({
    page,
    fixtureFile,
  }) => {
    for (const attempt of [1, 2]) {
      await page.goto(ROUTES.RUN_NEW)
      await importSingleFile(page, fixtureFile("single/loop.gpx"))
      await expect(page.getByLabel("Distance")).toHaveValue("5.02")
      await disableDiscord(page)
      await page.getByRole("button", { name: "Enregistrer" }).click()
      if (attempt === 1) await expect(page).toHaveURL(/\/runs\/[^/]+$/)
    }
    await expect(
      page.getByText("Une course quasi identique existe déjà à cette date."),
    ).toBeVisible()
    await expect(page).toHaveURL(ROUTES.RUN_NEW)
  })

  test("un fichier glissé-déposé remplit le formulaire", async ({
    page,
    fixtureFile,
  }) => {
    await page.goto(ROUTES.RUN_NEW)
    await page.getByRole("tab", { name: "Importer un fichier" }).click()
    await page
      .getByText(/Glisse ton fichier/)
      .drop({ files: fixtureFile("single/drop.gpx") })

    await expect(page.getByText("Données importées de drop.gpx")).toBeVisible()
    await expect(page.getByLabel("Nom")).toHaveValue("Boucle déposée e2e")
    await expect(page.getByLabel("Distance")).toHaveValue("4.39")
  })
})
