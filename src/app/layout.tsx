import "@/styles/globals.css"
import { fonts } from "@/styles/fonts"
import { cn } from "@/lib/utils/cn"

import { Providers } from "@/app/providers"

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
