import { prisma } from "@/lib/db/prisma"
import { getRequiredAdmin } from "@/lib/auth/auth-session"
import { UsersTable } from "./_components/users-table"
import { CreateUserDialog } from "./_components/create-user-dialog"

export default async function AdminUsersPage() {
  const currentUser = await getRequiredAdmin()

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      displayUsername: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      banReason: true,
      banExpires: true,
      onboardingCompleted: true,
      createdAt: true,
      image: true,
      _count: { select: { sessions: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} compte{users.length > 1 ? "s" : ""}
          </p>
        </div>
        <CreateUserDialog />
      </div>
      <UsersTable users={users} currentUserId={currentUser.id} />
    </div>
  )
}
