import type { Metadata } from "next"

export const metadata: Metadata = {
  // Redéfinir le template : un `title` simple ici le ferait perdre aux pages enfants.
  title: { default: "Mes courses", template: "%s | Run Together" },
}

export default function RunsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
