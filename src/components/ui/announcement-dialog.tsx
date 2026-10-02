"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/shadcn-ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn-ui/dialog"

const storageKey = (id: string) => `announcement:${id}`

/**
 * Annonce d'une nouveauté, montrée une seule fois par navigateur : `id` versionné
 * (« profile-images-v1 ») pour en publier une autre plus tard.
 */
export function AnnouncementDialog({
  id,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  id: string
  title: string
  description: string
  actionLabel: string
  actionHref: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey(id))) setOpen(true)
    } catch {
      // Stockage indisponible (navigation privée…) : on n'insiste pas.
    }
  }, [id])

  const dismiss = () => {
    setOpen(false)
    try {
      localStorage.setItem(storageKey(id), new Date().toISOString())
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
            <Sparkles className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={dismiss}>
            Plus tard
          </Button>
          <Button asChild onClick={dismiss}>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
