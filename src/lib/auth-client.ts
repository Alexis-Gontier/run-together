import { createAuthClient } from "better-auth/react"
// import { APP_URL } from "@/utils/constants"
import {
    adminClient,
    usernameClient
} from "better-auth/client/plugins"

export const authClient = createAuthClient({
    // baseURL: APP_URL,
    plugins: [
        usernameClient(),
        adminClient(),
    ]
})