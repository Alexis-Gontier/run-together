import { createAuthClient } from "better-auth/react"
import { APP_URL } from "@/utils/constants"

export const authClient = createAuthClient({
    baseURL: APP_URL
})