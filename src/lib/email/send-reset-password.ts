import { resend } from "./resend"

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
            subject: "Réinitialisation de votre mot de passe",
            html: `
                <h1>Réinitialisation de mot de passe</h1>
                <p>Bonjour ${username},</p>
                <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
                <p>Ce lien expire dans 1 heure.</p>
                <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            `,
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
