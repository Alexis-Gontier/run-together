import type { Metadata } from "next"
import Link from "next/link"

import { AUTH_ROUTES } from "@/lib/constants/routes"
import { RegisterForm } from "./_components/register-form"

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créez votre compte RunTogether.",
  robots: { index: true, follow: true },
}

export default function RegisterPage() {
  return (
    <>
      <div className="space-y-2">
        <h2 className="font-semibold text-4xl tracking-tight">
          Créer un compte
        </h2>
        <p className="text-muted-foreground text-sm">
          Rejoignez la communauté RunTogether
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-muted-foreground text-sm">
        Vous avez déjà un compte ?{" "}
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-foreground underline underline-offset-4 transition-colors hover:text-muted-foreground"
        >
          Se connecter
        </Link>
      </p>
    </>
  )
}
