import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sortie",
}

export default function RunDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
