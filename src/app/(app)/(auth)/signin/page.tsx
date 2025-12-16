import Link from 'next/link'
import { SigninWithUsernameForm } from '@/components/auth/signin-with-username-form'

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-4xl">
                    Bon retour
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Connectez-vous à votre compte
                </h3>
            </div>
            <SigninWithUsernameForm />
            <p className="text-center text-sm text-muted-foreground">
                Vous n&apos;avez pas de compte ?{" "}
                <Link
                    href="/signup"
                    className="text-foreground underline hover:text-muted-foreground"
                >
                    S&apos;inscrire
                </Link>
            </p>
        </>
    )
}
