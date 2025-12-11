import { resend } from "./resend"
import { ResetPasswordEmailTemplate } from "./templates/reset-password-template"

type SendResetPasswordEmailProps = {
    email: string
    username: string
    resetUrl: string
}

export async function sendResetPasswordEmail({
    email,
    username,
    resetUrl,
}: SendResetPasswordEmailProps) {
    try {
        const { data, error } = await resend.emails.send({
            from: "Run Together <onboarding@resend.dev>",
            to: email,
            subject: "Réinitialisation de votre mot de passe - Run Together",
            html: ResetPasswordEmailTemplate({ username, resetUrl }),
        })

        if (error) {
            console.error("Erreur envoi email:", error)
            return { success: false, error }
        }

        return { success: true, data }
    } catch (error) {
        console.error("Erreur:", error)
        return { success: false, error }
    }
}
