type PrivateLayoutProps = {
    children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
    return (
        <>
            {children}
        </>
    )
}