import { getRequiredUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"
import { OnboardingWizard } from "./_components/onboarding-wizard"

type OnboardingPageProps = {
  searchParams: Promise<{ step?: string }>
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const user = await getRequiredUser()
  const { step } = await searchParams

  const stravaAccount = await prisma.stravaAccount.findUnique({
    where: { userId: user.id },
    select: { stravaAthleteId: true },
  })

  const initialStep = step === "3" ? 3 : 0

  return (
    <OnboardingWizard
      initialStep={initialStep}
      userName={user.name}
      userEmail={user.email}
      isStravaConnected={!!stravaAccount}
    />
  )
}
