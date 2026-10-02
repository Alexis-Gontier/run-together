import { Pool } from "pg"
import { E2E } from "./env"

/**
 * Accès direct à la base e2e, pour le nettoyage seulement (le client Prisma généré n'est pas
 * chargeable par le transpileur de Playwright). Ne touche qu'aux données de l'utilisateur e2e.
 */
const pool = new Pool({ connectionString: E2E.databaseUrl, max: 1 })

const USER_ID = `(SELECT id FROM "user" WHERE username = $1)`

/** Supprime courses (splits en cascade), records et badges des utilisateurs e2e. */
export async function resetE2eRuns(): Promise<void> {
  for (const username of [E2E.username, E2E.rivalUsername]) {
    for (const table of ["run", "personal_record", "user_badge"]) {
      await pool.query(`DELETE FROM "${table}" WHERE "userId" = ${USER_ID}`, [
        username,
      ])
    }
  }
}

/** Pose une course (sans splits ni records) pour un utilisateur e2e. */
export async function insertRun(
  username: string,
  run: {
    distance: number
    duration: number
    elevation?: number
    daysAgo: number
  },
): Promise<void> {
  await pool.query(
    `INSERT INTO "run" (id, "userId", source, name, distance, duration, pace, elevation, date, "updatedAt")
     VALUES (gen_random_uuid()::text, ${USER_ID}, 'MANUAL', 'Course e2e', $2, $3, $4, $5,
             now() - make_interval(days => $6), now())`,
    [
      username,
      run.distance,
      run.duration,
      Math.round((run.duration / run.distance) * 1000),
      run.elevation ?? 0,
      run.daysAgo,
    ],
  )
}

/** Notifications de bataille entre les deux utilisateurs e2e (journal `notify()`). */
export async function battleNotifications(): Promise<
  {
    status: string
    payload: { embeds: { title: string; description: string }[] }
  }[]
> {
  const { rows } = await pool.query(
    `SELECT status, payload FROM "discord_notification"
     WHERE type = 'battle.result' AND "dedupeKey" LIKE '%' || ${USER_ID} || '%'`,
    [E2E.rivalUsername],
  )
  return rows
}

export async function deleteBattleNotifications(): Promise<void> {
  await pool.query(
    `DELETE FROM "discord_notification"
     WHERE type = 'battle.result' AND "dedupeKey" LIKE '%' || ${USER_ID} || '%'`,
    [E2E.rivalUsername],
  )
}
