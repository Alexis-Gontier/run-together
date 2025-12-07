import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

type PublicLayoutProps = {
    children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <>
            <PublicHeader />
            {children}
            <PublicFooter />
        </>
    )
}