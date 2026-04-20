"use client"

import { CenteredLayout } from "@/components/layout/centered-layout"
import { Button } from "@/components/shadcn-ui/button"
import { toast } from "sonner"

export default function page() {
  function handleClick() {
    toast.success("Hello world!")
  }

  return (
    <CenteredLayout>
      <Button size="lg" onClick={handleClick} className="cursor-pointer">
        Click me
      </Button>
    </CenteredLayout>
  )
}
