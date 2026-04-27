import type { Metadata } from "next"
import "@/styles/globals.css"
import { fonts } from "@/styles/fonts"
import { cn } from "@/lib/utils/cn"

import { Providers } from "@/app/providers"

export const metadata: Metadata = {
  title: {
    default: "Run Together",
    template: "%s | Run Together",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={cn("font-sans", ...fonts)}
      suppressHydrationWarning
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
