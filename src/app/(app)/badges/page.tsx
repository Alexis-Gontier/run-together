import { notFound } from "next/navigation"
import { env } from "@/env"

export default function BadgesPage() {
  if (env.NODE_ENV === "production") notFound()
  return null
}
