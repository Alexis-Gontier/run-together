import { Pool } from "pg"
import { E2E } from "./env"

/**
 * Accès direct à la base e2e, pour le nettoyage seulement (le client Prisma généré n'est pas
 * chargeable par le transpileur de Playwright). Ne touche qu'aux données de l'utilisateur e2e.
 */
const pool = new Pool({ connectionString: E2E.databaseUrl, max: 1 })

const USER_ID = `(SELECT id FROM "user" WHERE username = $1)`

/** Supprime courses (splits en cascade), records et badges de l'utilisateur e2e. */
export async function resetE2eRuns(): Promise<void> {
  for (const table of ["run", "personal_record", "user_badge"]) {
    await pool.query(`DELETE FROM "${table}" WHERE "userId" = ${USER_ID}`, [
      E2E.username,
    ])
  }
}
