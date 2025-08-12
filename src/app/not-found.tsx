import Link from "next/link";
import { Button } from "@/components/shadcn-ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <h1 className="text-4xl font-bold mb-4 text-foreground">404 - Page Not Found</h1>
            <p className="mb-8 text-muted-foreground">
                Désolé, la page que vous recherchez n&apos;existe pas.
            </p>
            <Button asChild>
                <Link href="/dashboard">
                    Retour à l&apos;accueil
                </Link>
            </Button>
        </div>
    );
}