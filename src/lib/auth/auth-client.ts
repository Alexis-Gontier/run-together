import { createAuthClient } from "better-auth/react"
import { env } from "@/lib/utils/env"
import {
    usernameClient,
    adminClient
} from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: env.NEXT_PUBLIC_APP_URL,
    plugins: [
        adminClient(),
        usernameClient()
    ],
})