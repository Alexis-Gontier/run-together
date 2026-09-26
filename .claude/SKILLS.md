# Skills du projet — provenance

Il n'existe **aucun lock pour les skills** : une skill est un dossier avec un `SKILL.md`, sans
version ni somme de contrôle. **La copier dans `.claude/skills/` est donc le mécanisme de lock** :
le contenu est figé et versionné avec le dépôt, qui suffit sur une machine neuve. Contrepartie :
ces copies ne reçoivent jamais les corrections amont.

**À mettre à jour à chaque ajout ou rafraîchissement.**

## Propres au projet

| Skill           | Rôle                                                          |
| --------------- | ------------------------------------------------------------- |
| `form`          | Formulaire React Hook Form + Zod v4 + composants Field shadcn |
| `new-component` | Composant selon l'architecture en couches                     |
| `new-route`     | Route : page, action, schéma, composant                       |

## Copies figées de skills externes

Copiées depuis `~/.claude/skills/` le **26 septembre 2026**.

| Skill                                 | Origine     | Utile pour                                 |
| ------------------------------------- | ----------- | ------------------------------------------ |
| `better-auth-best-practices`          | Better Auth | config auth, plugins username / admin      |
| `better-auth-security-best-practices` | Better Auth | rate limit, sessions, secrets              |
| `prisma-cli`                          | Prisma      | migrations, generate                       |
| `prisma-client-api`                   | Prisma      | requêtes                                   |
| `upfetch`                             | up-fetch    | clients Strava / Discord                   |
| `shadcn`                              | shadcn/ui   | composants, registres (shadcn-map)         |
| `vercel-react-best-practices`         | Vercel      | perf React / Next                          |
| `web-design-guidelines`               | Vercel      | audit UI / accessibilité                   |
| `ui-ux-pro-max`                       | communauté  | direction visuelle de la refonte           |
| `playwright-best-practices`           | communauté  | tests e2e, audit navigué des pages         |

Ces skills existent aussi en version personnelle : **doublon assumé**, prix de la portabilité.

### Rafraîchir une copie

    rm -rf .claude/skills/<nom> && cp -rL ~/.claude/skills/<nom> .claude/skills/<nom>

(`-L` : les skills personnelles sont des liens symboliques.) Puis mettre à jour la date
ci-dessus. À faire lors d'une montée majeure de la lib concernée, pas au fil de l'eau.

## Agents

| Agent                 | Rôle                                                     |
| --------------------- | -------------------------------------------------------- |
| `convention-reviewer` | Relit un diff contre les CLAUDE.md du projet             |
| `next-docs`           | Répond sur Next 16 depuis `node_modules/next/dist/docs/` |

## Hooks

| Hook                    | Événement              | Rôle                                                                                                                                                                  |
| ----------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conventions-guard.mjs` | PreToolUse Write/Edit  | refuse `process.env` hors env, `new PrismaClient`, resolver zod, `z.string().email()`, `"use client"` sur page/layout, chemins de route en dur, `.schema()` v7 |
| `biome-format.mjs`      | PostToolUse Write/Edit | `biome check --write` sur le fichier écrit                                                                                                                            |
