import Link from "next/link"

type AuthLayoutProps = {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-svh grid lg:grid-cols-[1fr_2fr]">
            <main className="relative flex flex-col justify-center items-center bg-muted border-r-2">
                <div className="absolute top-6 left-6 lg:top-8 lg:left-8">
                    <Link href="/" className="text-xl font-bold">
                        RunTogether
                    </Link>
                </div>
                <div className="w-full max-w-sm px-6 lg:px-0 space-y-8">
                    {children}
                </div>
            </main>
            <aside className="relative hidden lg:block">

            </aside>
        </div>
    )
}