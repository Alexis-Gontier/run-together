import "@/styles/globals.css";
import { fontVariables } from "@/styles/fonts";

import { Providers } from "@/app/providers";
import { Toaster } from "@/components/shadcn-ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={fontVariables}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            // closeButton
          />
        </Providers>
      </body>
    </html>
  );
}
