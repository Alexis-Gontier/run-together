import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

import {
    openAPI,
    username,
    admin,
} from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import { env } from "@/utils/env";

import { APP_URL } from "@/utils/constants";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: APP_URL,
    trustedOrigins: [APP_URL],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: false,
        disableSignUp: env.NODE_ENV === "production",
        minPasswordLength: 2,
        // maxPasswordLength: 128,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 jours
        updateAge: 60 * 60 * 24,     // 1 jour
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        },
        freshAge: 60 * 5 // 5 minutes
    },
    plugins: [
        ...(env.NODE_ENV === "development" ? [openAPI()] : []),
        username(),
        admin(),
        nextCookies() // make sure this is the last plugin in the array
    ],
});