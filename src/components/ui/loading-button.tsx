import type { VariantProps } from "class-variance-authority"
import { Loader2Icon } from "lucide-react"
import type * as React from "react"
import { Button, type buttonVariants } from "@/components/shadcn-ui/button"

function LoadingButton({
  isLoading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean
    asChild?: boolean
  }) {
  return (
    <Button disabled={isLoading || disabled} {...props}>
      {isLoading && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  )
}

export { LoadingButton }
