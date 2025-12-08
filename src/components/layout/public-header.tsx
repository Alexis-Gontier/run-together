import Link from "next/link";
import { Button } from "@/components/shadcn-ui/button";
import { GitHubStar } from "@/components/github/github-star";

export function PublicHeader() {

    const NAVLINK = [
        {
            href: "/features",
            label: "Product"
        },
        {
            href: "/pricing",
            label: "Pricing"
        },
        {
            href: "/blog",
            label: "Blog"
        },
    ];

    return (
        <header className="z-20 sticky top-0 left-0 w-full h-16 border-b backdrop-blur bg-background/80">
            <nav className="h-full max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-lg font-bold">
                        RunTogether
                    </Link>
                    <div className="flex gap-2">
                        {NAVLINK.map((link) => (
                            <Button
                                key={link.href}
                                variant="ghost"
                                size="sm"
                                className="text-sm cursor-pointer"
                                asChild
                            >
                                <Link href={link.href}>
                                    {link.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <GitHubStar
                        owner="Alexis-Gontier"
                        repo="run-together"
                        className="text-xs text-muted-foreground"
                    />
                    <Button
                        variant="default"
                        size="sm"
                        className="text-xs cursor-pointer"
                        asChild
                    >
                        <Link href="/signin">
                            Sign in
                        </Link>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
