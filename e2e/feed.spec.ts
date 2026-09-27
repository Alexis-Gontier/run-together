import { ROUTES } from "@/lib/constants/routes"
import { expect, test } from "./support/fixtures"

// Régression : les libellés posés sur la miniature masquaient le lien de la carte.
test("un clic sur la miniature d'une course du fil ouvre sa page", async ({
  page,
  fixtureFile,
}) => {
  await page.goto(ROUTES.RUN_NEW)
  await page.getByRole("tab", { name: "Plusieurs fichiers" }).click()
  await page
    .getByLabel(/Glisse plusieurs fichiers/)
    .setInputFiles(fixtureFile("single/feed.gpx"))
  const imported = page.getByRole("link", { name: /4\.71 km/ })
  await expect(imported).toBeVisible()
  const runUrl = await imported.getAttribute("href")

  await page.goto(`${ROUTES.HOME}?feed=me`)
  const thumbnail = page
    .getByRole("article")
    .first()
    .getByRole("img", { name: "Tracé du parcours" })
  await expect(thumbnail).toBeVisible()

  // Clic « à l'aveugle » au centre de la miniature, comme un utilisateur : c'est l'élément
  // au premier plan à cet endroit qui le reçoit.
  const box = await thumbnail.boundingBox()
  if (!box) throw new Error("miniature sans boîte")
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

  await expect(page).toHaveURL(runUrl ?? /\/runs\//)
})
