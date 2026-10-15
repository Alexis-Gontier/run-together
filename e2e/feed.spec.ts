import { ROUTES } from "@/lib/constants/routes"
import {
  disableDiscord,
  expect,
  importSingleFile,
  RUN_PAGE,
  test,
} from "./support/fixtures"

// Régression : les libellés posés sur la miniature masquaient le lien de la carte.
test("un clic sur la miniature d'une course du fil ouvre sa page", async ({
  page,
  fixtureFile,
}) => {
  await page.goto(ROUTES.RUN_NEW)
  await importSingleFile(page, fixtureFile("single/feed.gpx"))
  await disableDiscord(page)
  await page.getByRole("button", { name: "Enregistrer" }).click()
  await expect(page).toHaveURL(RUN_PAGE)
  const runUrl = page.url()

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
