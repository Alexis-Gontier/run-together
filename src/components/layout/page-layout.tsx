export default function PageLayout({
    children,
    className
}: {
    children: React.ReactNode,
    className?: string,
}) {

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${className}`}>
      {children}
    </div>
  )
}