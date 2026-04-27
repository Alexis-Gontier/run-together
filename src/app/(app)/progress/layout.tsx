import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Progression",
}

export default function ProgressLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
