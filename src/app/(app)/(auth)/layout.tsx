import Link from "next/link"
import Image from "next/image";
import { getCurrentYear } from "@/lib/utils/date";

type AuthLayoutProps = {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-svh grid lg:grid-cols-[1fr_1.6fr]">
            <main className="relative flex flex-col justify-center items-center border-r-2">
                <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
                    <Link href="/" className="text-xl font-bold">
                        RunTogether
                    </Link>
                </div>
                <div className="relative w-full max-w-sm px-6 lg:px-0 space-y-8">
                    {children}
                </div>
                <p className="absolute bottom-4 max-w-sm text-center text-xs text-muted-foreground">
                    By clicking continue, you agree to our <Link href="/terms" className="underline">Terms of Service</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
                </p>
            </main>
            <aside className="relative hidden lg:block bg-muted">
                <Image
                    src="/placeholder.svg"
                    alt="Image"
                    fill
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </aside>
        </div>
    )
}