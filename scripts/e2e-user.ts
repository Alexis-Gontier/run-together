/**
 * Crée ou remet à zéro l'utilisateur des tests e2e : onboarding terminé, rôle `user`, mot de
 * passe connu, aucune course. Lancé par `e2e/auth.setup.ts` ; à la main :
 * `pnpm exec tsx scripts/e2e-user.ts`. La base vient de `e2e/support/env.ts`
 * (`.env.e2e.local` ou `.env.local`, jamais la production) : pas de `dotenv/config`, qui lirait `.env`.
 */
import { randomUUID } from "node:crypto"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashPassword } from "better-auth/crypto"
import { E2E } from "../e2e/support/env"
import { PrismaClient } from "../src/generated/prisma/client"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: E2E.databaseUrl }),
})

async function main() {
  const password = await hashPassword(E2E.password)
  const profile = {
    name: "Coureur e2e",
    displayUsername: E2E.username,
    onboardingCompleted: true,
    publishRunsToDiscord: false,
    role: "user",
    banned: false,
    // Ni photo ni bannière : l'annonce « photo de profil » doit pouvoir s'afficher.
    image: null,
    bannerImage: null,
  }

  const existing = await prisma.user.findUnique({
    where: { username: E2E.username },
    select: { id: true },
  })
  const userId = existing?.id ?? randomUUID()
  if (existing) {
    await prisma.user.update({ where: { id: userId }, data: profile })
  } else {
    await prisma.user.create({
      data: {
        id: userId,
        email: `${E2E.username}@run-together.test`,
        username: E2E.username,
        ...profile,
      },
    })
  }

  await prisma.account.deleteMany({
    where: { userId, providerId: "credential" },
  })
  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password,
    },
  })

  // Repart de zéro : courses (splits en cascade), records, badges, sessions.
  await prisma.run.deleteMany({ where: { userId } })
  await prisma.personalRecord.deleteMany({ where: { userId } })
  await prisma.userBadge.deleteMany({ where: { userId } })
  await prisma.session.deleteMany({ where: { userId } })

  console.log(`[e2e] utilisateur ${E2E.username} prêt (${userId})`)

  // Adversaire des batailles `/compare` : jamais connecté, aucune course hors des tests.
  const rival = await prisma.user.upsert({
    where: { username: E2E.rivalUsername },
    update: {},
    create: {
      id: randomUUID(),
      email: `${E2E.rivalUsername}@run-together.test`,
      username: E2E.rivalUsername,
      displayUsername: E2E.rivalUsername,
      name: "Rival e2e",
      onboardingCompleted: true,
      publishRunsToDiscord: false,
      role: "user",
    },
    select: { id: true },
  })
  await prisma.run.deleteMany({ where: { userId: rival.id } })
  await prisma.personalRecord.deleteMany({ where: { userId: rival.id } })
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
