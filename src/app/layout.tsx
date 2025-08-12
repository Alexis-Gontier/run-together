import "@/styles/globals.css";
import { inter } from "@/styles/fonts";

import type { Metadata } from "next";

import Providers from "@/app/providers";
import { Toaster } from "@/components/shadcn-ui/sonner"
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "RunTogether",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
