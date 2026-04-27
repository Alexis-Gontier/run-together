import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sorties",
}

export default function RunsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
