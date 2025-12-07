import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(["development", "production", "test"])
            .default("development"),
        DATABASE_URL: z
            .string()
            .min(1),
        BETTER_AUTH_SECRET: z
            .string()
            .min(1),
    },
    client: {
        NEXT_PUBLIC_APP_URL: z
            .string()
            .url(),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    }
});