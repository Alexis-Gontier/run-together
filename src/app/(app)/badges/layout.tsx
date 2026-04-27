import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Badges",
}

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
