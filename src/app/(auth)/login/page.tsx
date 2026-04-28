import Link from "next/link"
import type { Metadata } from "next"

import { AUTH_ROUTES } from "@/lib/constants/routes"
import { LoginWithUsernameForm } from "./_components/login-with-username-form"

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte RunTogether.",
  robots: { index: true, follow: true },
}

export default function LoginPage() {
  return (
    <>
      <div className="space-y-2">
        <h2 className="text-4xl font-semibold tracking-tight">Bon retour</h2>
        <p className="text-sm text-muted-foreground">
          Connectez-vous à votre compte
        </p>
      </div>
      <LoginWithUsernameForm />
      <p className="text-center text-sm text-muted-foreground">
        Vous n&apos;avez pas de compte ?{" "}
        <Link
          href={AUTH_ROUTES.REGISTER}
          className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
        >
          S&apos;inscrire
        </Link>
      </p>
    </>
  )
}
