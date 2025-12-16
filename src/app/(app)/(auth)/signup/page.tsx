import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function page() {
    return (
        <>
            <div className="space-y-2">
                <h2 className="text-4xl">
                    Commencer
                </h2>
                <h3 className="text-sm text-muted-foreground">
                    Créez un nouveau compte
                </h3>
            </div>
            <SignupForm />
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
