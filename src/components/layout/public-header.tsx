import { Button } from "@/components/shadcn-ui/button";
import { Github } from "lucide-react";
import Link from "next/link";

export function PublicHeader() {
    return (
        <header className="z-20 sticky top-0 left-0 w-full h-16 border-b backdrop-blur bg-background/80">
            <nav className="h-full max-w-7xl mx-auto flex justify-between items-center">
                <div>
                    <Link href="/" className="text-lg font-bold">
                        RunTogether
                    </Link>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs cursor-pointer"
                    >
                        <Github />
                        94.1k
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs cursor-pointer"
                    >
                        Sign in
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="text-xs cursor-pointer"
                    >
                        Start your project
                    </Button>
                </div>
            </nav>
        </header>
    )
}
