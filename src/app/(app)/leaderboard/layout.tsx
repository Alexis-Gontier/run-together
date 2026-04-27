import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Classement",
}

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
