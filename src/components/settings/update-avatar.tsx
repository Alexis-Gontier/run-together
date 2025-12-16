"use client"

import { useState, useRef, useTransition } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar"
import { Button } from "@/components/shadcn-ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn-ui/card"
import { ImageCrop, ImageCropContent, ImageCropApply, ImageCropReset } from "@/components/ui/image-crop"
import { authClient } from "@/lib/auth/auth-client"
import { toast } from "sonner"
import { Upload, Trash2, Loader2, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function UpdateAvatar() {
  const { data: session, refetch } = authClient.useSession()
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const user = session?.user

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error("La taille du fichier ne doit pas dépasser 5 Mo")
      return
    }

    setSelectedFile(file)
    setCroppedImage(null)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setCroppedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadCroppedImage = async (imageUrl: string) => {
    setCroppedImage(imageUrl)
    setIsUploading(true)
    const toastId = toast.loading("Upload de l'avatar...")

    try {
      // Convert blob URL to actual blob
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      // Create file from blob
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" })

      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      })

      let data
      try {
        data = await uploadResponse.json()
      } catch (e) {
        console.error("Failed to parse response:", e)
        throw new Error("Réponse invalide du serveur")
      }

      if (!uploadResponse.ok) {
        console.error("Upload failed:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          data
        })
        throw new Error(data.message || `Erreur ${uploadResponse.status}: ${uploadResponse.statusText}`)
      }

      if (!data.success) {
        throw new Error(data.message || "Échec de l'upload")
      }

      toast.success(data.message || "Avatar mis à jour avec succès !", { id: toastId })

      // Refresh session and router
      await refetch()
      router.refresh()

      // Reset state
      handleReset()
    } catch (error) {
      console.error("Error uploading avatar:", error)
      const errorMessage = error instanceof Error ? error.message : "Échec de l'upload de l'avatar"
      toast.error(errorMessage, { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = () => {
    startTransition(async () => {
      const toastId = toast.loading("Suppression de l'avatar...")

      try {
        const response = await fetch("/api/avatar/upload", {
          method: "DELETE",
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Échec de la suppression")
        }

        toast.success("Avatar supprimé avec succès !", { id: toastId })

        // Refresh session and router
        await refetch()
        router.refresh()
      } catch (error) {
        console.error("Error deleting avatar:", error)
        toast.error(error instanceof Error ? error.message : "Échec de la suppression de l'avatar", { id: toastId })
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photo de profil</CardTitle>
        <CardDescription>
          Téléchargez et recadrez une image pour personnaliser votre profil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile && !croppedImage && (
          <>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading || isPending}
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isPending}
                  variant="outline"
                >
                  <Upload className="h-4 w-4" />
                  Télécharger une photo
                </Button>

                {user.image && (
                  <Button
                    onClick={handleDelete}
                    disabled={isUploading || isPending}
                    variant="outline"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Suppression...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Formats acceptés : JPG, PNG, GIF. Taille maximale : 5 Mo.
            </p>
          </>
        )}

        {selectedFile && !croppedImage && (
          <div className="space-y-4">
            <ImageCrop
              file={selectedFile}
              aspect={1}
              maxImageSize={1024 * 1024}
              onCrop={handleUploadCroppedImage}
            >
              <ImageCropContent className="max-w-md" />
              <div className="flex items-center gap-2">
                <ImageCropApply />
                <ImageCropReset />
                <Button
                  onClick={handleReset}
                  size="icon"
                  type="button"
                  variant="ghost"
                  disabled={isUploading}
                >
                  <XIcon className="size-4" />
                </Button>
              </div>
            </ImageCrop>
          </div>
        )}

        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Upload en cours...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
