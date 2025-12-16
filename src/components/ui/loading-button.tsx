import { Button, buttonVariants } from "@/components/shadcn-ui/button"
import { Spinner } from "@/components/shadcn-ui/spinner"
import { cn } from "@/lib/utils/cn"
import { type VariantProps } from "class-variance-authority"

export interface LoadingButtonProps
    extends React.ComponentProps<"button">,
        VariantProps<typeof buttonVariants> {
    isPending?: boolean
    loadingText?: string
    asChild?: boolean
}

export function LoadingButton({
    isPending,
    loadingText,
    className,
    children,
    disabled,
    variant,
    size,
    asChild,
    ...props
}: LoadingButtonProps) {
    const displayText = isPending
        ? loadingText || (typeof children === 'string' ? `${children}...` : children)
        : children

    return (
        <Button
            className={cn(isPending && "cursor-wait", className)}
            disabled={isPending || disabled}
            variant={variant}
            size={size}
            asChild={asChild}
            {...props}
        >
            {isPending && <Spinner />}
            {displayText}
        </Button>
    )
}
