"use client"

import { Button } from '@/components/shadcn-ui/button'
import { authClient } from '@/lib/auth-client'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { LogoutIcon, LogoutIconHandle } from '@/components/shadcn-ui/logout'
import { useRef } from "react"

export default function SignOutButton() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const iconRef = useRef<LogoutIconHandle>(null)

    function handleSignOut() {
        startTransition(async () => {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Déconnexion réussie");
                        router.push("/sign-in");
                    },
                    onError: (ctx) => {
                        toast.error(ctx.error.message);
                    },
                },
            })
        })
    }

    return (
        <form>
            <Button
                type="submit"
                variant="destructive"
                size="sm"
                className="w-full p-0 cursor-pointer"
                disabled={isPending}
                formAction={handleSignOut}
                onMouseEnter={() => iconRef.current?.startAnimation()}
                onMouseLeave={() => iconRef.current?.stopAnimation()}
            >
                {isPending ? (
                    <>
                        <Loader className="animate-spin" />
                        Déconnexion
                    </>
                ) : (
                    <>
                        <LogoutIcon
                            ref={iconRef}
                        />
                        Déconnexion
                    </>
                )}
            </Button>
        </form>
    )
}