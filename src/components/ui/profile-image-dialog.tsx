"use client"

import { ImageUp, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { useEffect, useRef, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { toast } from "sonner"
import { Button } from "@/components/shadcn-ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn-ui/dialog"
import { Slider } from "@/components/shadcn-ui/slider"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  removeProfileImageAction,
  uploadProfileImageAction,
} from "@/lib/actions/profile/profile-image-actions"
import {
  PROFILE_IMAGE_KINDS,
  type ProfileImageKind,
} from "@/lib/profile-images/config"
import { cropImage } from "@/lib/profile-images/crop-image"
import { cn } from "@/lib/utils/cn"

// Fichier source (avant recadrage) : au-delà, le navigateur peine à le décoder.
const MAX_SOURCE_BYTES = 20 * 1024 * 1024

/** Choix + recadrage + envoi d'une photo de profil ou d'une bannière. */
export function ProfileImageDialog({
  kind,
  currentUrl,
  children,
}: {
  kind: ProfileImageKind
  currentUrl: string | null
  children: React.ReactNode
}) {
  const config = PROFILE_IMAGE_KINDS[kind]
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [cropping, setCropping] = useState(false)

  // Libère l'URL de l'ancien fichier choisi.
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source)
    },
    [source],
  )

  const done = (message: string) => {
    toast.success(message)
    setOpen(false)
    setSource(null)
    router.refresh()
  }

  const upload = useAction(uploadProfileImageAction, {
    onSuccess: ({ data }) => {
      if (data?.error) toast.error(data.error)
      else done("Image mise à jour")
    },
    onError: () => toast.error("Envoi impossible, réessaie."),
  })
  const remove = useAction(removeProfileImageAction, {
    onSuccess: () => done("Image retirée"),
    onError: () => toast.error("Suppression impossible, réessaie."),
  })

  const pick = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith("image/"))
      return toast.error("Choisis un fichier image.")
    if (file.size > MAX_SOURCE_BYTES)
      return toast.error("Image trop lourde (20 Mo maximum).")
    setSource(URL.createObjectURL(file))
    setCrop({ x: 0, y: 0 })
    setZoom(1)
  }

  const save = async () => {
    if (!source || !area) return
    setCropping(true)
    try {
      const dataUrl = await cropImage(source, area, config.width, config.height)
      upload.execute({ kind, dataUrl })
    } catch {
      toast.error("Impossible de traiter cette image.")
    } finally {
      setCropping(false)
    }
  }

  const isAvatar = kind === "avatar"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSource(null)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="first-letter:uppercase">
            {config.label}
          </DialogTitle>
          <DialogDescription>
            {source
              ? "Déplace et zoome pour cadrer l'image."
              : isAvatar
                ? "Une image carrée, affichée en rond."
                : "Une image large (format 3:1), en haut de ton profil."}
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            pick(e.target.files?.[0])
            e.target.value = ""
          }}
        />

        {source ? (
          <div className="space-y-4">
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-lg bg-muted",
                isAvatar ? "aspect-square" : "aspect-3/1",
              )}
            >
              <Cropper
                image={source}
                crop={crop}
                zoom={zoom}
                aspect={config.width / config.height}
                cropShape={isAvatar ? "round" : "rect"}
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setArea(pixels)}
              />
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={([v]) => setZoom(v)}
              aria-label="Zoom"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 overflow-hidden border-2 border-dashed bg-muted/40 text-muted-foreground text-sm transition-colors hover:bg-muted",
              isAvatar
                ? "mx-auto aspect-square max-w-60 rounded-full"
                : "aspect-3/1 rounded-lg",
            )}
          >
            {currentUrl ? (
              // biome-ignore lint/performance/noImgElement: aperçu d'une URL Blob
              <img src={currentUrl} alt="" className="size-full object-cover" />
            ) : (
              <>
                <ImageUp className="size-6" />
                Choisir une image
              </>
            )}
          </button>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {source ? (
            <Button variant="ghost" onClick={() => inputRef.current?.click()}>
              Autre image
            </Button>
          ) : currentUrl ? (
            <LoadingButton
              variant="ghost"
              className="text-destructive"
              isLoading={remove.isPending}
              onClick={() => remove.execute({ kind })}
            >
              <Trash2 />
              Retirer
            </LoadingButton>
          ) : (
            <span />
          )}
          {source ? (
            <LoadingButton
              isLoading={cropping || upload.isPending}
              onClick={save}
            >
              Enregistrer
            </LoadingButton>
          ) : (
            <Button onClick={() => inputRef.current?.click()}>
              <ImageUp />
              {currentUrl ? "Changer" : "Choisir une image"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
