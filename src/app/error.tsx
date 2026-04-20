"use client"

import { useEffect } from "react"
import { CenteredLayout } from "@/components/layout/centered-layout"

type ErrorProps = {
  error: Error & { digest?: string }
}

export default function Error({ error }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return <CenteredLayout>500 - Internal Server Error</CenteredLayout>
}
