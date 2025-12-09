import { Resend } from "resend"
import { env } from "@/lib/utils/env"

export const resend = new Resend(env.RESEND_API_KEY)