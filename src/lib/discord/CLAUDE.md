# Discord Library — notifications via webhook

## Files

| File                     | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `client.ts`              | `postToDiscord(message)` — up-fetch, `?wait=true`, 2 retries on 429/5xx  |
| `embeds/*.ts`            | **Pure** message builders (tested): run created, welcome, test, recap    |
| `notify.ts`              | `notify({ type, dedupeKey, message })`, `resendNotification(id)`        |
| `events.ts`              | `notifyRunCreated`, `notifyMemberJoined`, `sendTestNotification`         |
| `recap.ts`               | `previousWeek(now)`, `getWeeklyRecapData(start, end)`                    |

## Rules

- **Never call `postToDiscord` directly from app code** — go through `notify()` (or an
  `events.ts` function), which dedupes and writes the `DiscordNotification` log.
- `notify()` never throws: a Discord failure must not fail the action that triggered it.
- `dedupeKey` is unique; a key already `SENT` is skipped. Keys: `run.created:{runId}`,
  `member.joined:{userId}`, `recap.weekly:{yyyy-MM-dd of Monday}`, `test:{timestamp}`.
- The exact payload is stored, so `/admin/discord` can resend a `FAILED` row as-is.
- Builders stay pure (no Prisma, no env): data loading happens in `events.ts` / `recap.ts`.

## Events

| Type            | Trigger                                                              |
| --------------- | -------------------------------------------------------------------- |
| `run.created`   | `recordRun()` when `notify` — form switch (default = user preference `publishRunsToDiscord`), Strava: `!silent && publishRunsToDiscord` |
| `member.joined` | `completeOnboardingAction`                                           |
| `recap.weekly`  | Vercel Cron `GET /api/cron/weekly-recap` (Monday 07:00 UTC, `Authorization: Bearer $CRON_SECRET`; `?dry=1[&at=YYYY-MM-DD]` returns the message without sending) |
| `test`          | « Tester le webhook » in `/admin/discord`                            |
| `badge.unlocked`| reserved for badges (phase 6)                                        |

The run embed image is `/api/og/run/[runId]`, which draws the route as SVG from the polyline
(no external map service).

Recap week = previous Monday 00:00 UTC → Monday 00:00 UTC. No run in the week → nothing sent.
