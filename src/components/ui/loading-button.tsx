import { Button } from "@/components/shadcn-ui/button"
import { Spinner } from "@/components/shadcn-ui/spinner"
import { cn } from "@/lib/utils/cn"

type LoadingButtonProps =
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        isPending?: boolean
    }

export function LoadingButton({
    isPending,
    className,
    children,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <Button
            className={cn("w-full flex items-center gap-2", className)}
            disabled={isPending || disabled}
            {...props}
        >
            {isPending && <Spinner />}
            {children}
        </Button>
    )
}
