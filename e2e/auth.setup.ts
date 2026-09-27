import { execFileSync } from "node:child_process"
import { join } from "node:path"
import { expect, test as setup } from "@playwright/test"
import { E2E } from "./support/env"

setup("prépare l'utilisateur e2e", () => {
  // Le script charge le client Prisma généré : on le lance sous tsx, hors du transpileur Playwright.
  execFileSync(process.execPath, ["--import", "tsx", "scripts/e2e-user.ts"], {
    cwd: join(__dirname, ".."),
    stdio: "inherit",
  })
})

// Une seule connexion par exécution : better-auth limite à 5 tentatives par minute.
setup("se connecte", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Nom d'utilisateur").fill(E2E.username)
  await page.getByLabel("Mot de passe").fill(E2E.password)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await expect(page).toHaveURL(/\/home$/)
  await page.context().storageState({ path: E2E.storageState })
})
