"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

import {
  createUserSchema,
  type CreateUserType,
} from "@/lib/schemas/admin-schema"
import { createUserAction } from "../_actions/create-user-action"

import { Button } from "@/components/shadcn-ui/button"
import { Input } from "@/components/shadcn-ui/input"
import { Label } from "@/components/shadcn-ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"

export function CreateUserDialog() {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const form = useForm<CreateUserType>({
    resolver: standardSchemaResolver(createUserSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  const { execute, isPending } = useAction(createUserAction, {
    onSuccess: () => {
      toast.success("Utilisateur créé.")
      form.reset()
      startTransition(() => router.refresh())
    },
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Une erreur est survenue."),
  })

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          <UserPlus className="h-4 w-4" />
          Créer un utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit((data) => execute(data))}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="cu-username">Username</Label>
            <Input id="cu-username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cu-name">Nom affiché</Label>
            <Input id="cu-name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cu-email">Email</Label>
            <Input id="cu-email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cu-password">Mot de passe</Label>
            <Input
              id="cu-password"
              type="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select
              defaultValue="user"
              onValueChange={(v) =>
                form.setValue("role", v as "user" | "admin", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user" className="cursor-pointer">
                  User
                </SelectItem>
                <SelectItem value="admin" className="cursor-pointer">
                  Admin
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Création…" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
