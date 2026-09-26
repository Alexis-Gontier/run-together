"use client"

import { NuqsAdapter } from "nuqs/adapters/next/app"
import { Toaster } from "@/components/shadcn-ui/sonner"
import { ThemeProvider } from "@/providers/theme-provider"

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <NuqsAdapter>{children}</NuqsAdapter>
      <Toaster />
    </ThemeProvider>
  )
}
