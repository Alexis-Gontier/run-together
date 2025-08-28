import { isAdmin, listUsers } from '@/lib/auth-admin'
import { unauthorized } from 'next/navigation'

import {
  Table as TableComponent,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn-ui/table"
import { Button } from '@/components/shadcn-ui/button'
import TextHeading from '@/components/ui/text-heading'
import ListUser from '@/components/admin/list-user'

export default async function page() {
  const admin = await isAdmin()

  if (!admin) {
    return unauthorized()
  }

  const users = await listUsers()

  return (
    <>
      <TextHeading
        title="Administration"
        description="Gérez les utilisateurs et les paramètres de l'application"
      />
      <div className="rounded-md border">
        <TableComponent>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="py-2">
                <Button
                  variant="ghost"
                  className="cursor-pointer"
                  title="Trier par date"
                >
                  User
                </Button>
              </TableHead>
              <TableHead className="py-2">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ListUser users={users.users} />
          </TableBody>
        </TableComponent>
      </div>
    </>
  )
}
