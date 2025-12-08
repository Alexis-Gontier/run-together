"use client"

import { Button } from "@/components/shadcn-ui/button"
import { LogOut } from "lucide-react"
import { authClient } from "@/lib/auth/auth-client"
import { useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LogoutButton() {

    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    async function handleClick() {
        startTransition(async () => {
            const toastId = toast.loading("Déconnexion en cours...")
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Déconnecté avec succès", { id: toastId });
                        router.replace("/signin");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error?.message || "Une erreur est survenue lors de la déconnexion", { id: toastId });
                    },
                },
            })
        })
    }

    return (
        <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={handleClick}
        >
            <LogOut />
            Déconnexion
        </Button>
    )
}