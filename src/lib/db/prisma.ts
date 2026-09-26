import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "@/env"
import { PrismaClient } from "@/generated/prisma/client"

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

// Réutilise le client entre les rechargements à chaud en dev.
const globalForPrisma = globalThis as unknown as {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>
}

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

if (env.NODE_ENV !== "production") globalForPrisma.prismaGlobal = prisma

export { prisma }
