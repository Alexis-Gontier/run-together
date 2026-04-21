import { CenteredLayout } from "@/components/layout/centered-layout"
import { Countdown } from "@/components/ui/countdown"

export default function page() {
  return (
    <CenteredLayout>
      <Countdown target="2026-04-26T10:00:00Z" />
    </CenteredLayout>
  )
}
