import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db/prisma"
import { env } from "@/env"

import { username, admin } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  rateLimit: {
    enabled: true,
    window: 60, // 60s
    max: 5, // 5 tentatives par fenêtre
  },
  session: {
    expiresIn: 60 * 60 * 24 * 365, // 365j
    updateAge: 60 * 60 * 24, // 1j
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5m
      strategy: "compact",
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    disableSignUp: env.NODE_ENV === "production",
  },
  user: {
    additionalFields: {
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
  plugins: [
    username(),
    admin(),
    nextCookies(), // make sure this is the last plugin in the array
  ],
})
