import { CenteredLayout } from "@/components/layout/centered-layout"

type OnboardingLayoutProps = {
  children: React.ReactNode
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <CenteredLayout>
      <div className="w-full max-w-lg px-4">{children}</div>
    </CenteredLayout>
  )
}
