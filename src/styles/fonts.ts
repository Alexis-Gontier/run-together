import { Inter, Geist } from "next/font/google"

const geistHeading = Geist({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fonts = [geistHeading.variable, inter.variable]
