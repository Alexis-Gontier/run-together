import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Radars",
}

export default function ChartsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
