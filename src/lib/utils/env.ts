import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z
            .enum(["development", "production", "test"])
            .default("development"),
        DATABASE_URL: z
            .string()
            .min(1, "DATABASE_URL is required"),
        BETTER_AUTH_SECRET: z
            .string()
            .min(1, "BETTER_AUTH_SECRET is required"),
        RESEND_API_KEY: z
            .string()
            .min(1, "RESEND_API_KEY is required"),
        BLOB_READ_WRITE_TOKEN: z
            .string()
            .min(1, "BLOB_READ_WRITE_TOKEN is required"),
    },
    client: {
        NEXT_PUBLIC_APP_URL: z
            .string()
            .min(1, "NEXT_PUBLIC_APP_URL is required"),
    },
    experimental__runtimeEnv: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    }
});