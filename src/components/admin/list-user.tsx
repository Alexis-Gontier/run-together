"use client"

import { toast } from 'sonner'
import { Button } from '../shadcn-ui/button'
import { TableCell, TableRow } from '../shadcn-ui/table'
import { impersonate } from '@/actions/admin/impersonate.action'
import { useRouter } from 'next/navigation'

type Props = {
  users: {
    id: string
    email: string
    displayUsername?: string
  }[]
  total?: number
  limit?: number
  offset?: number
}

export default function ListUser({ users }: Props) {

    const router = useRouter();

    async function handleImpersonate(userId: string) {
        try {
            const { success, message } = await impersonate(userId)
            if (success) {
                router.refresh()
                toast.success("Imitation réussie")
            } else {
                console.error("Erreur impersonateUser:", message)
                toast.error(message)
            }
        } catch (err) {
            console.error("Erreur impersonateUser:", err)
            toast.error("Erreur lors de l'imitation")
        }
    }

    return (
        <>
            {users.map((user) => (
                <TableRow key={user.id}>
                    <TableCell>{user.displayUsername}</TableCell>
                    <TableCell>
                        <Button
                            onClick={() => handleImpersonate(user.id)}
                        >
                            Impersonnate
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}
