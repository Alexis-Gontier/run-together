# Discord Library — notifications via webhook

## Files

| File                     | Purpose                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `client.ts`              | `postToDiscord(message)` — up-fetch, `?wait=true`, 2 retries on 429/5xx  |
| `embeds/*.ts`            | **Pure** message builders (tested): run created, welcome, test, recap    |
| `notify.ts`              | `notify({ type, dedupeKey, message })`, `holdNotification`, `resendNotification(id)` |
| `events.ts`              | `notifyRunCreated`, `notifyMemberJoined`, `sendTestNotification`         |
| `recap.ts`               | `previousWeek(now)`, `weekFromMonday(day)`, `getWeeklyRecapData(start, end)` |
| `ranking.ts`             | `previousMonth(now)`, `monthRange(yyyy-MM)`, `getMonthlyRankingData(start, end)` |

## Rules

- **Never call `postToDiscord` directly from app code** — go through `notify()` (or an
  `events.ts` function), which dedupes and writes the `DiscordNotification` log.
- `notify()` never throws: a Discord failure must not fail the action that triggered it.
- `dedupeKey` is unique; a key already `SENT` (or being sent) is skipped. `notify` claims the
  row first (`FAILED` + error « Envoi en cours ») so two simultaneous calls post once; a crash
  mid-send leaves that row, resendable from the admin. Keys: `run.created:{runId}`, `record.set:{runId}`,
  `member.joined:{userId}`, `recap.weekly:{yyyy-MM-dd of Monday}`, `ranking.monthly:{yyyy-MM}`,
  `battle.result:{sorted userIds}:{period}:{yyyy-MM-dd}`, `test:{timestamp}`.
- The exact payload is stored, so `/admin/discord` can resend a `FAILED` row as-is.
  `holdNotification` logs a `FAILED` row without sending (the `record.set` text when the run
  image failed: resend the run first, then the records).
- Builders stay pure (no Prisma, no env): data loading happens in `events.ts` / `recap.ts`.

## Events

| Type            | Trigger                                                              |
| --------------- | -------------------------------------------------------------------- |
| `run.created`   | `recordRun()` when `notify` — form switch (default = user preference `publishRunsToDiscord`), Strava: `!silent && publishRunsToDiscord` |
| `record.set`    | Right after `run.created` when the run sets personal records: plain text (`content`, no embed) with the times and gains |
| `member.joined` | `completeOnboardingAction`                                           |
| `recap.weekly`  | Vercel Cron `GET /api/cron/weekly-recap` (Monday 07:00 UTC, `Authorization: Bearer $CRON_SECRET`; `?dry=1[&at=YYYY-MM-DD]` returns the message without sending) |
| `test`          | « Tester le webhook » in `/admin/discord`                            |
| `badge.unlocked`| `recordRun()` when `notify` and the run unlocks badges (`badge.unlocked:{runId}`) |
| `battle.result` | « Publier le résultat » on `/compare` (`publishBattleAction`, score recomputed server-side; once per pair/period/day) |
| `ranking.monthly` | Vercel Cron `GET /api/cron/monthly-ranking` (1st of month 07:00 UTC, previous month in Paris time, distance ranking; same auth and `?dry=1[&at=]` as the recap) |

**Every embed carries an OG image** (`next/og`, 1200×630, shared theme in `src/lib/og/theme.tsx`,
URLs via the `og*Route` helpers in `routes.ts`). **Embeds are image-first**: no author, title,
description, footer or timestamp — the image carries all that. Text only for what the image
can't show: ranking lines beyond `OG_MAX_RANKING`, recap records beyond
`OG_MAX_RECAP_RECORDS`. The run embed is the image alone, plus a « Voir la course » link button (`components`,
webhook called with `with_components=true`) (gold when it sets
records); the records follow as a separate `record.set` text message.

- `/api/og/run/[runId]` — full-height map on the left (route as SVG over Esri « Dark Gray »
  raster tiles, free, no key, attribution drawn; `src/lib/maps/raster-tiles.ts`), panel on the
  right: avatar + name + date, run name, big distance, pace / duration / D+ (records are not
  drawn: they go out in the `record.set` text message). Tiles failing → route alone on a plain background; no GPS → per-km pace
  bars from the splits; neither GPS nor splits → the panel alone, full width (distance + stats
  side by side).
- `/api/og/badges/[runId]` — runner panel (count + collection progress) and the medals of the
  badges unlocked by that run (`UserBadge.runId`), up to `OG_MAX_BADGES`, then « + N autres badges »
  (no text in the embed). Same Lucide icons as `BadgeMedal`, drawn from the `lucide` package data
  (`src/lib/og/badge-icon.ts`): Satori can't run lucide-react components.
- `/api/og/recap/[yyyy-MM-dd]` — `OgSummaryPanel` (period, total km, runs, runners) + distance
  podium, regularity podium, best pace and the week's records (`yyyy-MM-dd` = Monday of the week, Paris day).
- `/api/og/ranking/[yyyy-MM]` — `OgSummaryPanel` + the top `OG_MAX_RANKING` with rank pills
  and distance bars (month in Paris time).
- `/api/og/battle/[a]/[b]/[period]?at=yyyy-MM-dd` — score + line-by-line duel, recomputed
  with the `/compare` utils (`a` = the publisher). `at` = publication day: the period ends
  that day and the URL differs per day (Discord caches by URL); records stay current ones.
  Lines empty on both sides are hidden.
- `/api/og/member/[userId]` — welcome card: banner behind, avatar (initial if none).
- `/api/og/test` — static; the embed adds `?t=` so Discord really refetches it.

Avatars and banners are WebP in Blob, which Satori can't read: `fetchImage` (`src/lib/og/`)
converts them to PNG with `sharp`.

Discord fetches these URLs itself: they must be public (`/api` is outside the proxy matcher),
so images only show when `NEXT_PUBLIC_APP_URL` is reachable from the internet (not localhost).

Recap week = previous Monday 00:00 → Monday 00:00, **Paris time** (`src/lib/utils/paris.ts`),
like the badges. No run in the week → nothing sent.

When what an image showed is gone (run deleted, member left, no run left in the period), the
route answers `ogUnavailable(...)` (`src/lib/og/unavailable.tsx`) with a 200, never a 404:
Discord refetches images of old messages and would show a broken one.
