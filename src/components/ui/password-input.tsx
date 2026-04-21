"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { cn } from "@/lib/utils/cn"
import { usePasswordVisibility } from "@/hooks/use-password-visibility"
import { Input } from "@/components/shadcn-ui/input"

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const { visible, toggle, inputType } = usePasswordVisibility()

  return (
    <div className="relative">
      <Input
        type={inputType}
        data-slot="input"
        className={cn(className)}
        {...props}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
      >
        {visible ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </div>
  )
}

export { PasswordInput }
