import Link from 'next/link'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

type ResetPasswordPageProps = {
    searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const params = await searchParams
    const token = params.token
    const error = params.error

    if (error) {
        return (
            <>
                <div className="space-y-2">
                    <h2 className="text-3xl">
                        Lien invalide
                    </h2>
                    <h3 className="text-sm text-muted-foreground">
                        Le lien de réinitialisation est invalide ou a expiré
                    </h3>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/forgot-password"
                        className="text-foreground underline hover:text-muted-foreground"
                    >
                        Demander un nouveau lien
                    </Link>
                </p>
            </>
        )
    }

    if (!token) {
        return (
            <>
                <div className="space-y-2">
                    <h2 className="text-3xl">
                        Aucun jeton
                    </h2>
                    <h3 className="text-sm text-muted-foreground">
                        Aucun jeton de réinitialisation n&apos;a été fourni
                    </h3>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                    <Link
                        href="/forgot-password"
                        className="text-foreground underline hover:text-muted-foreground"
                    >
                        Demander un nouveau lien
                    </Link>
                </p>
            </>
        )
    }

    return (
        <>
            <div className="space-y-2">
                <h2 className="text-3xl">
                    Réinitialiser le mot de passe
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Entrez votre nouveau mot de passe ci-dessous
                </h3>
            </div>
            <ResetPasswordForm token={token} />
            <p className="text-center text-sm text-muted-foreground">
                Vous vous souvenez de votre mot de passe ?{" "}
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
