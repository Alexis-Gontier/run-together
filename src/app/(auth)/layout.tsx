import Image from "next/image"
import Link from "next/link"

import { ROUTES } from "@/lib/constants/routes"

type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1.6fr]">
      <main className="relative flex flex-col items-center justify-center border-r">
        <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
          <Link
            href={ROUTES.LANDING}
            className="text-xl font-bold tracking-tight"
          >
            RunTogether
          </Link>
        </div>
        <div className="relative w-full max-w-md space-y-8 px-6 lg:px-8">
          {children}
        </div>
        <p className="absolute bottom-4 max-w-md px-6 text-center text-xs text-muted-foreground lg:px-8">
          En cliquant sur continuer, vous acceptez nos{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Conditions d&apos;utilisation
          </Link>{" "}
          et notre{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </main>
      <aside className="relative hidden bg-muted lg:block">
        <Image
          src="/images/l6.png"
          alt="RunTogether"
          fill
          className="object-cover"
          priority
        />
      </aside>
    </div>
  )
}
