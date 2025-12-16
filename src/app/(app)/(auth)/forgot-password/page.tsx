import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-3xl">
                    Mot de passe oublié ?
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </h3>
            </div>
            <ForgotPasswordForm />
            <p className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link
                    href="/signin"
                    className="text-foreground underline hover:text-muted-foreground"
                >
                    Se connecter
                </Link>
            </p>
        </>
    )
}
