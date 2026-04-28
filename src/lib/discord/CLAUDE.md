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

Currently called only from `importStravaActivity()`. Add new notification functions here when extending to other events (e.g. badges, PRs, group runs).
