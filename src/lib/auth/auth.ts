import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/utils/env";
import { nextCookies } from "better-auth/next-js";
import {
    username,
    admin,
} from "better-auth/plugins"
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password";

export const auth = betterAuth({
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
    allowedDevOrigins: [env.NEXT_PUBLIC_APP_URL],
    cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5m
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
        sendResetPassword: async ({ user, url }) => {
            await sendResetPasswordEmail({
                email: user.email,
                username: user.name || user.email,
                resetUrl: url,
            })
        },
    },
    resetPasswordTokenExpiresIn: 3600, // 1h
    user: {
        changeEmail: {
            enabled: true,
            updateEmailWithoutVerification: true,
        },
    },
    plugins: [
        username(),
        admin(),
        nextCookies(), // make sure this is the last plugin in the array
    ],
});