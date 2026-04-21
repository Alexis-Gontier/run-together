import { CenteredLayout } from "@/components/layout/centered-layout"

type AuthLayoutProps = {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <CenteredLayout>
      <div className="w-full max-w-md px-4">{children}</div>
    </CenteredLayout>
  )
}
