"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { banUserAction } from "../_actions/ban-user-action"
import { unbanUserAction } from "../_actions/unban-user-action"
import { deleteUserAction } from "../_actions/delete-user-action"
import { setRoleAction } from "../_actions/set-role-action"
import { impersonateUserAction } from "../_actions/impersonate-user-action"
import { setOnboardingAction } from "../_actions/set-onboarding-action"
import { revokeSessionsAction } from "../_actions/revoke-sessions-action"
import { changePasswordAction } from "../_actions/change-password-action"

import { Button } from "@/components/shadcn-ui/button"
import { Badge } from "@/components/shadcn-ui/badge"
import { Input } from "@/components/shadcn-ui/input"
import { Label } from "@/components/shadcn-ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn-ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog"
import { MoreHorizontal } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"

type AdminUser = {
  id: string
  username: string | null
  displayUsername: string | null
  name: string
  email: string
  role: string | null
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  onboardingCompleted: boolean
  createdAt: Date
  image: string | null
  _count: { sessions: number }
}

type DialogState = { open: boolean; userId: string; username: string }

const closedDialog: DialogState = { open: false, userId: "", username: "" }

export function UsersTable({
  users,
  currentUserId,
}: {
  users: AdminUser[]
  currentUserId: string
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [search, setSearch] = useState("")
  const [banDialog, setBanDialog] = useState<DialogState>(closedDialog)
  const [banReason, setBanReason] = useState("")
  const [deleteDialog, setDeleteDialog] = useState<DialogState>(closedDialog)
  const [passwordDialog, setPasswordDialog] =
    useState<DialogState>(closedDialog)
  const [newPassword, setNewPassword] = useState("")

  const refresh = () => startTransition(() => router.refresh())

  const { execute: executeBan, isPending: isBanning } = useAction(
    banUserAction,
    {
      onSuccess: () => {
        toast.success("Utilisateur banni.")
        setBanDialog(closedDialog)
        setBanReason("")
        refresh()
      },
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Une erreur est survenue."),
    },
  )

  const { execute: executeUnban } = useAction(unbanUserAction, {
    onSuccess: () => {
      toast.success("Bannissement levé.")
      refresh()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  const { execute: executeDelete } = useAction(deleteUserAction, {
    onSuccess: () => {
      toast.success("Utilisateur supprimé.")
      setDeleteDialog(closedDialog)
      refresh()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  const { execute: executeSetRole } = useAction(setRoleAction, {
    onSuccess: () => {
      toast.success("Rôle modifié.")
      refresh()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  const { execute: executeImpersonate, isPending: isImpersonating } = useAction(
    impersonateUserAction,
    {
      onSuccess: () => {
        toast.success("Session d'impersonification active.")
        router.push(ROUTES.HOME)
      },
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Une erreur est survenue."),
    },
  )

  const { execute: executeSetOnboarding } = useAction(setOnboardingAction, {
    onSuccess: ({ input }) => {
      toast.success(
        input.completed
          ? "Onboarding marqué comme complété."
          : "Onboarding réinitialisé.",
      )
      refresh()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  const { execute: executeChangePassword, isPending: isChangingPassword } =
    useAction(changePasswordAction, {
      onSuccess: () => {
        toast.success("Mot de passe modifié.")
        setPasswordDialog(closedDialog)
        setNewPassword("")
      },
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Une erreur est survenue."),
    })

  const { execute: executeRevokeSessions } = useAction(revokeSessionsAction, {
    onSuccess: ({ data }) => {
      toast.success(
        `${data?.count ?? 0} session${(data?.count ?? 0) > 1 ? "s" : ""} révoquée${(data?.count ?? 0) > 1 ? "s" : ""}.`,
      )
      refresh()
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  const filtered = search
    ? users.filter((u) => {
        const q = search.toLowerCase()
        return (
          u.username?.toLowerCase().includes(q) ||
          u.displayUsername?.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        )
      })
    : users

  return (
    <>
      <div className="space-y-4">
        <Input
          placeholder="Rechercher par nom, username ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Onboarding
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Sessions
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Inscrit le
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-muted/25"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {user.displayUsername ?? user.name}
                    </p>
                    {user.username && (
                      <p className="text-xs text-muted-foreground">
                        @{user.username}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role ?? "user"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {user.banned ? (
                      <Badge variant="destructive">Banni</Badge>
                    ) : (
                      <Badge variant="outline">Actif</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.onboardingCompleted ? (
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-600"
                      >
                        Complété
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-orange-500 text-orange-600"
                      >
                        En attente
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count.sessions}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {user.id !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 cursor-pointer p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              executeSetRole({
                                userId: user.id,
                                role: user.role === "admin" ? "user" : "admin",
                              })
                            }
                          >
                            {user.role === "admin"
                              ? "Rétrograder en user"
                              : "Promouvoir en admin"}
                          </DropdownMenuItem>
                          {user.banned ? (
                            <DropdownMenuItem
                              onClick={() => executeUnban({ userId: user.id })}
                            >
                              Débannir
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                setBanDialog({
                                  open: true,
                                  userId: user.id,
                                  username: user.displayUsername ?? user.name,
                                })
                              }
                            >
                              Bannir
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              executeImpersonate({ userId: user.id })
                            }
                            disabled={isImpersonating}
                          >
                            Impersonifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setPasswordDialog({
                                open: true,
                                userId: user.id,
                                username: user.displayUsername ?? user.name,
                              })
                            }
                          >
                            Changer le mot de passe
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            Diagnostic
                          </DropdownMenuLabel>
                          {user.onboardingCompleted ? (
                            <DropdownMenuItem
                              onClick={() =>
                                executeSetOnboarding({
                                  userId: user.id,
                                  completed: false,
                                })
                              }
                            >
                              Réinitialiser l&apos;onboarding
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                executeSetOnboarding({
                                  userId: user.id,
                                  completed: true,
                                })
                              }
                            >
                              Forcer l&apos;onboarding complété
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              executeRevokeSessions({ userId: user.id })
                            }
                            disabled={user._count.sessions === 0}
                          >
                            Révoquer les sessions ({user._count.sessions})
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                userId: user.id,
                                username: user.displayUsername ?? user.name,
                              })
                            }
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun utilisateur trouvé.
            </p>
          )}
        </div>
      </div>

      {/* Dialog bannissement */}
      <Dialog
        open={banDialog.open}
        onOpenChange={(open) => setBanDialog((d) => ({ ...d, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bannir {banDialog.username}</DialogTitle>
            <DialogDescription>
              L&apos;utilisateur ne pourra plus se connecter et toutes ses
              sessions seront révoquées.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Raison (optionnel)</Label>
            <Input
              id="ban-reason"
              placeholder="Spam, comportement inapproprié…"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanDialog(closedDialog)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={isBanning}
              onClick={() =>
                executeBan({
                  userId: banDialog.userId,
                  banReason: banReason || undefined,
                })
              }
            >
              {isBanning ? "Bannissement…" : "Bannir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog changement de mot de passe */}
      <Dialog
        open={passwordDialog.open}
        onOpenChange={(open) => {
          setPasswordDialog((d) => ({ ...d, open }))
          if (!open) setNewPassword("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>
              Nouveau mot de passe pour {passwordDialog.username}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="8 caractères minimum"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialog(closedDialog)}
            >
              Annuler
            </Button>
            <Button
              disabled={isChangingPassword || newPassword.length < 8}
              onClick={() =>
                executeChangePassword({
                  userId: passwordDialog.userId,
                  newPassword,
                })
              }
            >
              {isChangingPassword ? "Modification…" : "Modifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((d) => ({ ...d, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer {deleteDialog.username} ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données de
              l&apos;utilisateur (runs, sessions, compte Strava) seront
              définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={() => executeDelete({ userId: deleteDialog.userId })}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
