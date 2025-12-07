import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db/prisma";
import { env } from "@/lib/utils/env";
import { nextCookies } from "better-auth/next-js";
import {
    username,
    admin,
} from "better-auth/plugins"

export const auth = betterAuth({
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
    allowedDevOrigins: [env.NEXT_PUBLIC_APP_URL],
    cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        disableSignUp: env.NODE_ENV === "production",
        autoSignInAfterSignUp: true,
        minPasswordLength: 8,
        maxPasswordLength: 128,
    },
    plugins: [
        username(),
        admin(),
        nextCookies(), // make sure this is the last plugin in the array
    ],
});