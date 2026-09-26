# Phase 3 — Notifications Discord v2 : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline). Checkbox steps.

**Goal :** rendre les notifications Discord riches, fiables et traçables : embed détaillé avec
records battus, image OG sans service externe, journal d'envoi avec anti-doublon, renvoi et test
depuis l'admin, bienvenue des nouveaux membres, récap hebdomadaire, préférence utilisateur.

**Architecture :** `src/lib/discord/` se découpe en transport (`client.ts`, retry 429/5xx),
builders d'embed **purs** (`embeds/*.ts`, testés), orchestration (`notify.ts` : dédoublonnage →
envoi → journal `DiscordNotification`) et événements métier (`events.ts` : charge les données,
choisit le builder). `recordRun` appelle `notifyRunCreated(runId, newPRs)`.

**Spec :** `docs/superpowers/specs/2026-09-26-refonte-roadmap-design.md` § Phase 3.

## Global Constraints

- Aucun envoi Discord ne fait échouer l'action qui le déclenche (création de course, onboarding).
- Un `dedupeKey` déjà `SENT` n'est jamais renvoyé (sauf renvoi manuel admin d'un `FAILED`).
- Tests locaux sur la branche Neon `dev-refonte` (`.env.local`). **Migration Prisma : passer
  `DATABASE_URL` explicitement** — `prisma.config.ts` ne lit que `.env` (production).
- Le webhook de `.env` pointe sur un serveur Discord de test : envois locaux autorisés.
- Textes en français. Couleur de marque des embeds : `0x10b981` (vert de l'app) ; records :
  `0xf59e0b`.

---

### Task 1 : Tracé SVG pour l'image OG (plus de Mapbox)

**Files :** créer `src/lib/runs/track/decode-polyline.ts` (+ test), `src/lib/runs/track/route-svg.ts`
(+ test) ; modifier `src/app/api/og/run/[runId]/route.tsx`.

**Interfaces :**
- `decodePolyline(encoded: string): [number, number][]` (inverse exact de `encodePolyline`)
- `routeSvgPath(points: [number, number][], width: number, height: number, padding: number): string | null`
  — projection équirectangulaire corrigée par `cos(latitude moyenne)`, mise à l'échelle en
  conservant le ratio, centrée ; renvoie l'attribut `d` (`M x y L x y …`, 1 décimale) ou `null`
  si < 2 points.

- [ ] Tests : aller-retour `decodePolyline(encodePolyline(pts))` ≈ pts (1e-5) ; exemple Google
  décodé ; `routeSvgPath` d'un carré reste dans `[padding, width - padding] × [padding, height - padding]`
  et commence par `M` ; `null` pour 1 point ; nord en haut (latitude max → y min).
- [ ] Implémenter, puis dans la route OG : remplacer l'`<img>` Mapbox par
  `<svg width={1200} height={mapH}>` contenant un `<path d=… stroke={ACCENT} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />`
  + deux `<circle>` départ/arrivée ; fond `#111113` avec une grille légère. Sans tracé : bloc
  « Course sans GPS » centré avec la distance en grand. Retirer l'import `env` s'il ne sert plus.
- [ ] Vérifier : `curl -s -o og.png -w "%{http_code} %{content_type}" localhost:3000/api/og/run/<id>` → `200 image/png` pour une course avec et sans tracé ; lire les PNG.
- [ ] Commit `feat: draw run route as svg in og image instead of mapbox`

### Task 2 : Schéma — journal Discord et préférence

**Files :** `prisma/schema.prisma`, migration, `src/lib/auth/index.ts`.

```prisma
enum DiscordNotificationStatus {
  SENT
  FAILED
}

model DiscordNotification {
  id        String                    @id @default(cuid())
  type      String // run.created | member.joined | recap.weekly | badge.unlocked | test
  dedupeKey String                    @unique
  status    DiscordNotificationStatus
  payload   Json // corps exact envoyé au webhook, pour le renvoi
  error     String?
  attempts  Int                       @default(1)
  createdAt DateTime                  @default(now())
  sentAt    DateTime?

  @@index([createdAt])
  @@map("discord_notification")
}
```

`User` : `publishRunsToDiscord Boolean @default(true)` ; déclaré aussi dans
`user.additionalFields` de better-auth (`type: "boolean", required: false, defaultValue: true`).

- [ ] Modifier, puis `DATABASE_URL="<dev-refonte>" pnpm prisma migrate dev --name discord_notifications`
  (URL lue depuis `.env.local`). Vérifier que la migration SQL ne contient que des `CREATE` /
  `ALTER TABLE "user" ADD COLUMN`.
- [ ] `pnpm typecheck` ; commit `feat: add discord notification log and user publish preference`

### Task 3 : Transport, builders, orchestration

**Files :** `src/lib/discord/client.ts`, `embeds/{run-created,member-joined,weekly-recap,test}.ts`
(+ tests), `notify.ts`, `events.ts` ; supprimer `index.ts` ; mettre à jour `record-run.ts`,
`scripts/send-run-to-discord.ts`.

**Interfaces :**

```ts
// client.ts
export type DiscordMessage = { content?: string; embeds: DiscordEmbed[] }
export type DiscordEmbed = { title?: string; url?: string; description?: string; color?: number;
  author?: { name: string; url?: string; icon_url?: string }; fields?: { name: string; value: string; inline?: boolean }[];
  image?: { url: string }; thumbnail?: { url: string }; footer?: { text: string }; timestamp?: string }
export async function postToDiscord(message: DiscordMessage): Promise<void> // throw DiscordError

// embeds/run-created.ts (pur)
export type RunCreatedData = { runId: string; runName: string; userName: string; username: string | null;
  distance: number; duration: number; pace: number; elevation: number; heartRateAvg: number | null;
  date: Date; sportType: string | null; newPRs: NewPR[] }
export function buildRunCreatedMessage(data: RunCreatedData, appUrl: string): DiscordMessage

// notify.ts
export async function notify(input: { type: string; dedupeKey: string; message: DiscordMessage }):
  Promise<"sent" | "skipped" | "failed">   // ne lève jamais
export async function resendNotification(id: string): Promise<"sent" | "failed">

// events.ts
export async function notifyRunCreated(runId: string, newPRs: NewPR[]): Promise<void>
export async function notifyMemberJoined(userId: string): Promise<void>
export async function sendTestNotification(adminName: string): Promise<"sent" | "failed">
```

Règles de l'embed `run.created` :
- `author` = nom + lien profil ; `title` = nom de la course, `url` = page de la course ;
  `description` = « **{nom}** a couru **{km} km** en **{durée}** » (+ « · Trail » / « · Tapis »).
- `fields` inline : Distance, Allure (`formatRunPace` + « /km »), Durée
  (`formatRunDurationDisplay`), D+ si > 0, FC moy si connue.
- Si `newPRs` non vide : couleur records, champ non-inline « 🏆 Record(s) personnel(s) » avec une
  ligne par record : `**5 km** — 24'10"` + ` (ancien : 25'02", −52 s)` si `previousDuration`.
- `image` = `/api/og/run/{id}`, `timestamp` = date de la course (ISO), `footer` = « Run Together ».

- [ ] Tests purs des builders (champs présents/absents, formatage du gain de record, couleur).
- [ ] `client.ts` : up-fetch avec `baseUrl` du webhook, `?wait=true`, retry 2 fois si 429 ou ≥ 500
  (délai 1 s, ou `retry-after` si fourni et ≤ 5 s).
- [ ] `notify.ts` : `findUnique(dedupeKey)` → `SENT` ⇒ `"skipped"` ; sinon envoi puis `upsert`
  (`SENT` + `sentAt`, ou `FAILED` + `error` tronquée à 500 car. + `attempts++`).
- [ ] `events.ts` : `notifyRunCreated` charge run + user ; `dedupeKey` `run.created:{runId}`.
- [ ] `recordRun` : `if (options.notify) await notifyRunCreated(run.id, newPRs)` (après les
  records). Strava : `notify` = `!silent && user.publishRunsToDiscord`.
- [ ] Script `send-run-to-discord.ts` : réécrit pour appeler `notifyRunCreated` n'est pas possible
  hors Next (alias `@/`, env) → le script **supprimé**, remplacé par le renvoi admin (Task 5).
  Retirer le script `discord:send-run` de `package.json`.
- [ ] `pnpm test && pnpm typecheck && pnpm knip` ; commit `feat: rich discord run embeds with delivery log`

### Task 4 : Bienvenue et préférence utilisateur

**Files :** `complete-onboarding-action.ts`, `settings/_components/preferences-card.tsx` (+ nouveau
client `discord-preference-switch.tsx` + action `update-discord-preference-action.ts`),
`runs/new/page.tsx`, `run-form.tsx`.

- [ ] Onboarding terminé → `notifyMemberJoined(user.id)` (`member.joined:{userId}`), embed :
  « 👋 Bienvenue à **{nom}** dans Run Together ! » + lien profil.
- [ ] Settings : la ligne « Notifications » (switch désactivé) devient « Publier mes courses sur
  Discord » — switch réel, action `authActionClient` → `auth.api.updateUser({ body: { publishRunsToDiscord } , headers })`, toast.
- [ ] `/runs/new` : `defaultPublish = user.publishRunsToDiscord` passé à `RunForm`
  (prop `defaultPublish?: boolean`, valeur initiale du switch).
- [ ] Commit `feat: welcome message and per-user discord preference`

### Task 5 : Admin Discord

**Files :** `ADMIN_ROUTES.DISCORD = "/admin/discord"`, `src/app/(admin)/layout.tsx` (nav
Utilisateurs / Discord), `src/app/(admin)/admin/discord/page.tsx`,
`.../discord/_actions/{resend-notification,test-webhook}-action.ts`,
`.../discord/_components/{notifications-table,test-webhook-button}.tsx`.

- [ ] Page : 100 dernières notifications (date relative, type, clé, statut en badge vert/rouge,
  tentatives, erreur tronquée) ; compteurs envoyées / en échec sur 7 jours ; bouton
  « Tester le webhook » ; bouton « Renvoyer » sur les lignes `FAILED` (`adminActionClient`,
  `revalidatePath`).
- [ ] Commit `feat: admin page for discord notifications`

### Task 6 : Récap hebdomadaire

**Files :** `src/lib/discord/recap.ts` (requêtes), `embeds/weekly-recap.ts` (pur, testé),
`src/app/api/cron/weekly-recap/route.ts`, `src/env.ts` (`CRON_SECRET: z.string().min(16).optional()`),
`vercel.json` (`"crons": [{ "path": "/api/cron/weekly-recap", "schedule": "0 7 * * 1" }]`),
`API_ROUTES.CRON_WEEKLY_RECAP`, `.env.example`.

- [ ] Semaine = lundi 00:00 → lundi 00:00 **UTC** précédant l'exécution (documenté).
- [ ] Stats : total km et nb de courses du groupe ; top 3 distance ; top 3 nb de courses ;
  meilleure allure moyenne (≥ 10 km dans la semaine) ; records battus dans la semaine (records
  dont la course est dans la fenêtre). Aucune course → pas d'envoi.
- [ ] Route : `Authorization: Bearer ${CRON_SECRET}` sinon 401 ; `CRON_SECRET` absent → 503 ;
  `dedupeKey` `recap.weekly:{yyyy-MM-dd du lundi}` ; `?dry=1` renvoie le message JSON sans envoyer.
- [ ] Test du builder ; test manuel `curl -H "Authorization: Bearer …" "localhost:3000/api/cron/weekly-recap?dry=1"`.
- [ ] Commit `feat: weekly recap to discord via vercel cron`

### Task 7 : Docs et vérification

- [ ] Réécrire `src/lib/discord/CLAUDE.md` (fichiers, règles, événements, dédoublonnage, renvoi,
  cron) ; ligne Discord de `CLAUDE.md` racine ; `CRON_SECRET` dans `.env.example`.
- [ ] Vérif complète + test navigateur : créer une course → embed reçu, ligne `SENT` dans
  `/admin/discord` (le compte de test doit être passé admin sur la branche dev) ; « Tester le
  webhook » ; préférence désactivée → switch décoché par défaut.
- [ ] Commit `docs: document discord v2`
