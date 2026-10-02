import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parse } from "dotenv"

/**
 * Base de données des tests e2e : `.env.e2e.local` s'il existe (branche Neon dédiée), sinon
 * `.env.local` (branche de dev). Jamais `.env`, qui pointe vers la production : on refuse
 * de démarrer si l'endpoint Neon est le même.
 */
const ROOT = join(__dirname, "..", "..")

const readEnvFile = (name: string): Record<string, string> => {
  const path = join(ROOT, name)
  return existsSync(path) ? parse(readFileSync(path)) : {}
}

/** Endpoint Neon (`ep-xxx`), identique qu'on passe par le pooler ou non. */
const endpointOf = (url: string) =>
  new URL(url).hostname.split(".")[0].replace(/-pooler$/, "")

/** Lève si `url` vise la même base que `DATABASE_URL` de `.env` (production). */
export function assertNotProductionDb(url: string): void {
  const prod = readEnvFile(".env").DATABASE_URL
  if (prod && endpointOf(prod) === endpointOf(url)) {
    throw new Error(
      `[e2e] DATABASE_URL pointe vers la base de production (${endpointOf(url)}). Abandon.`,
    )
  }
}

const source = existsSync(join(ROOT, ".env.e2e.local"))
  ? ".env.e2e.local"
  : ".env.local"
const vars = readEnvFile(source)
if (!vars.DATABASE_URL) {
  throw new Error(`[e2e] DATABASE_URL absent de ${source}.`)
}
assertNotProductionDb(vars.DATABASE_URL)

export const E2E = {
  source,
  databaseUrl: vars.DATABASE_URL,
  dbHost: new URL(vars.DATABASE_URL).hostname,
  username: "e2e_runner",
  /** Adversaire de `/compare` : pas de mot de passe, des courses posées par les tests. */
  rivalUsername: "e2e_rival",
  password: vars.E2E_USER_PASSWORD ?? "e2e-runner-password",
  storageState: join(ROOT, "playwright", ".auth", "user.json"),
  files: join(ROOT, "e2e", "fixtures", "files"),
} as const
