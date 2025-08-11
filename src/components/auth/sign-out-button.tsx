"use client"

import { Button } from '@/components/shadcn-ui/button'
import { authClient } from '@/lib/auth-client'
import { LogOut, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

export default function SignOutButton() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    function handleSignOut() {
        startTransition(async () => {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Déconnexion réussie");
                        router.push("/sign-in");
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
            >
                {isPending ? (
                    <>
                        <Loader className="animate-spin" />
                        Déconnexion
                    </>
                ) : (
                    <>
                        <LogOut />
                        Déconnexion
                    </>
                )}
            </Button>
        </form>
    )
}