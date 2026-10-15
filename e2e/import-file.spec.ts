import { ROUTES } from "@/lib/constants/routes"
import {
  disableDiscord,
  expect,
  importSingleFile,
  RUN_PAGE,
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
    gps: true,
  },
  {
    file: "single/loop.tcx",
    name: "",
    date: "dim. 9 mars 2025",
    distance: "5.34",
    minutes: "29",
    seconds: "40",
    splits: 6,
    gps: true,
  },
  {
    file: "single/loop.fit",
    name: "",
    date: "dim. 16 mars 2025",
    distance: "5.66",
    minutes: "31",
    seconds: "25",
    splits: 6,
    gps: true,
  },
  {
    // Zepp sans GPS : distance reconstruite depuis la vitesse.
    file: "single/no-gps.fit",
    name: "",
    date: "dim. 11 mai 2025",
    distance: "3.00",
    minutes: "16",
    seconds: "40",
    splits: 3,
    gps: false,
  },
] as const

test.describe("import d'un fichier", () => {
  for (const f of FORMATS) {
    test(`${f.file.split("/").pop()} : formulaire pré-rempli puis enregistrement`, async ({
      page,
      fixtureFile,
    }) => {
      await page.goto(ROUTES.RUN_NEW)
      await importSingleFile(page, fixtureFile(f.file))

      const fileName = f.file.split("/").pop() ?? ""
      await expect(page.getByText(fileName, { exact: true })).toBeVisible()
      await expect(page.getByLabel("Nom")).toHaveValue(f.name)
      await expect(page.getByLabel("Date")).toHaveText(f.date)
      await expect(page.getByLabel("Heure de départ")).toHaveValue("08:00")
      await expect(page.getByLabel("Distance")).toHaveValue(f.distance)
      await expect(page.getByLabel("Heures")).toHaveValue("0")
      await expect(page.getByLabel("Minutes")).toHaveValue(f.minutes)
      await expect(page.getByLabel("Secondes")).toHaveValue(f.seconds)
      const trackLabel = f.gps ? "Tracé GPS" : "Sans tracé GPS"
      await expect(
        page.getByText(`${trackLabel} · ${f.splits} splits`),
      ).toBeVisible()
      await expect(
        page.getByRole("img", { name: "Tracé du parcours" }),
      ).toHaveCount(f.gps ? 1 : 0)

      await disableDiscord(page)
      await page.getByRole("button", { name: "Enregistrer" }).click()
      await expect(page).toHaveURL(RUN_PAGE)
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
      if (attempt === 1) await expect(page).toHaveURL(RUN_PAGE)
    }
    await expect(
      page.getByText("Une course quasi identique existe déjà à cette date."),
    ).toBeVisible()
    await expect(page).toHaveURL(ROUTES.RUN_NEW)
  })

  test("une course proche d'une existante demande confirmation", async ({
    page,
    fixtureFile,
  }) => {
    await page.goto(ROUTES.RUN_NEW)
    await importSingleFile(page, fixtureFile("nearby/first.gpx"))
    await disableDiscord(page)
    await page.getByRole("button", { name: "Enregistrer" }).click()
    await expect(page).toHaveURL(RUN_PAGE)

    await page.goto(ROUTES.RUN_NEW)
    await importSingleFile(page, fixtureFile("nearby/second.gpx"))
    await disableDiscord(page)
    await page.getByRole("button", { name: "Enregistrer" }).click()
    await expect(
      page.getByText("Tu as déjà une course à cette heure-là"),
    ).toBeVisible()
    await expect(
      page.getByText("Déjà enregistrée · Première e2e"),
    ).toBeVisible()
    await expect(page).toHaveURL(ROUTES.RUN_NEW)

    // Annuler rend le bouton d'origine, sans rien enregistrer.
    await page.getByRole("button", { name: "Annuler" }).click()
    await page.getByRole("button", { name: "Enregistrer", exact: true }).click()
    await page.getByRole("button", { name: "Enregistrer quand même" }).click()
    await expect(page).toHaveURL(RUN_PAGE)
    await expect(page.getByRole("heading", { name: "Course" })).toBeVisible()
  })

  test("un fichier glissé-déposé remplit le formulaire", async ({
    page,
    fixtureFile,
  }) => {
    await page.goto(ROUTES.RUN_NEW)
    await page
      .getByText("Dépose ta course")
      .drop({ files: fixtureFile("single/drop.gpx") })

    await expect(page.getByText("drop.gpx", { exact: true })).toBeVisible()
    await expect(page.getByLabel("Nom")).toHaveValue("Boucle déposée e2e")
    await expect(page.getByLabel("Distance")).toHaveValue("4.39")

    // « Annuler » revient à la zone de dépôt, sans rien enregistrer.
    await page.getByRole("button", { name: "Annuler" }).click()
    await expect(page.getByText("Dépose ta course")).toBeVisible()
    await expect(page).toHaveURL(ROUTES.RUN_NEW)
  })
})
