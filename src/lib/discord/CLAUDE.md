# Discord Library

## `sendRunNotification(payload)`

Posts a Discord embed to `DISCORD_WEBHOOK_URL` when a run is imported.

```ts
interface RunNotificationPayload {
  runId: string
  userName: string
  runName: string
}
```

The embed automatically includes the OG image (`/api/og/run/[runId]`) and a link to the run page.

Called only from `recordRun()` (`src/lib/runs/record-run.ts`) when `notify` is true — manual entry, file import and Strava all go through it. Add new notification functions here when extending to other events (e.g. badges, group runs).
