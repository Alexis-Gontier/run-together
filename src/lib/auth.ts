import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

import {
    openAPI,
    username,
    admin,
} from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";

import { APP_URL } from "@/utils/constants";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: APP_URL,
    trustedOrigins: [
        APP_URL
    ],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: false,
        // disableSignUp: true,
        // minPasswordLength: 8,
        // maxPasswordLength: 128,
    },
    plugins: [
        openAPI(),
        username(),
        admin(),
        nextCookies() // make sure this is the last plugin in the array
    ],
});