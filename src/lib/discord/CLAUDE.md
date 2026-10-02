# Discord Library — notifications via webhook

## Files

| File                     | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `client.ts`              | `postToDiscord(message)` — up-fetch, `?wait=true`, 2 retries on 429/5xx  |
| `embeds/*.ts`            | **Pure** message builders (tested): run created, welcome, test, recap    |
| `notify.ts`              | `notify({ type, dedupeKey, message })`, `resendNotification(id)`        |
| `events.ts`              | `notifyRunCreated`, `notifyMemberJoined`, `sendTestNotification`         |
| `recap.ts`               | `previousWeek(now)`, `getWeeklyRecapData(start, end)`                    |
| `ranking.ts`             | `previousMonth(now)`, `getMonthlyRankingData(start, end)`                |

## Rules

- **Never call `postToDiscord` directly from app code** — go through `notify()` (or an
  `events.ts` function), which dedupes and writes the `DiscordNotification` log.
- `notify()` never throws: a Discord failure must not fail the action that triggered it.
- `dedupeKey` is unique; a key already `SENT` is skipped. Keys: `run.created:{runId}`,
  `member.joined:{userId}`, `recap.weekly:{yyyy-MM-dd of Monday}`, `ranking.monthly:{yyyy-MM}`,
  `battle.result:{sorted userIds}:{period}:{yyyy-MM-dd}`, `test:{timestamp}`.
- The exact payload is stored, so `/admin/discord` can resend a `FAILED` row as-is.
- Builders stay pure (no Prisma, no env): data loading happens in `events.ts` / `recap.ts`.

## Events

| Type            | Trigger                                                              |
| --------------- | -------------------------------------------------------------------- |
| `run.created`   | `recordRun()` when `notify` — form switch (default = user preference `publishRunsToDiscord`), Strava: `!silent && publishRunsToDiscord` |
| `member.joined` | `completeOnboardingAction`                                           |
| `recap.weekly`  | Vercel Cron `GET /api/cron/weekly-recap` (Monday 07:00 UTC, `Authorization: Bearer $CRON_SECRET`; `?dry=1[&at=YYYY-MM-DD]` returns the message without sending) |
| `test`          | « Tester le webhook » in `/admin/discord`                            |
| `badge.unlocked`| `recordRun()` when `notify` and the run unlocks badges (`badge.unlocked:{runId}`) |
| `battle.result` | « Publier le résultat » on `/compare` (`publishBattleAction`, score recomputed server-side; once per pair/period/day) |
| `ranking.monthly` | Vercel Cron `GET /api/cron/monthly-ranking` (1st of month 07:00 UTC, previous month UTC, distance ranking; same auth and `?dry=1[&at=]` as the recap) |

Embed images (`next/og`, 1200×630, shared theme in `src/lib/og/theme.tsx`, URLs via
`ogRunRoute` / `ogBadgesRoute` / `ogRecapRoute` in `routes.ts`):

- `/api/og/run/[runId]` — route drawn as SVG over Esri « Dark Gray » raster tiles (free, no
  key, attribution drawn; `src/lib/maps/raster-tiles.ts`) + gold strip when the run holds personal
  records. Tiles failing → route alone on a plain background.
- `/api/og/badges/[runId]` — medals of the badges unlocked by that run (`UserBadge.runId`).
- `/api/og/recap/[yyyy-MM-dd]` — group totals + distance podium (Monday UTC of the week).

Discord fetches these URLs itself: they must be public (`/api` is outside the proxy matcher),
so images only show when `NEXT_PUBLIC_APP_URL` is reachable from the internet (not localhost).

Recap week = previous Monday 00:00 UTC → Monday 00:00 UTC. No run in the week → nothing sent.
