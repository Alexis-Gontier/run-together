"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Button } from "@/components/shadcn-ui/button"
import { cn } from "@/lib/utils/cn"

interface ImageCropContextValue {
  crop: Crop
  setCrop: (crop: Crop) => void
  completedCrop: PixelCrop | undefined
  setCompletedCrop: (crop: PixelCrop | undefined) => void
  imgRef: React.RefObject<HTMLImageElement>
  aspect: number
  file: File
  onCrop: (croppedImage: string) => void
  onReset: () => void
}

const ImageCropContext = createContext<ImageCropContextValue | undefined>(undefined)

function useImageCrop() {
  const context = useContext(ImageCropContext)
  if (!context) {
    throw new Error("useImageCrop must be used within ImageCrop")
  }
  return context
}

interface ImageCropProps {
  children: ReactNode
  file: File
  aspect?: number
  maxImageSize?: number
  onChange?: (crop: Crop) => void
  onComplete?: (crop: PixelCrop) => void
  onCrop: (croppedImage: string) => void
}

export function ImageCrop({
  children,
  file,
  aspect = 1,
  maxImageSize,
  onChange,
  onComplete,
  onCrop,
}: ImageCropProps) {
  // Initialize with a square crop
  const getInitialCrop = useCallback((): Crop => {
    if (aspect === 1) {
      // For square aspect ratio, use equal width and height
      return {
        unit: "%",
        width: 80,
        height: 80,
        x: 10,
        y: 10,
      }
    }
    // For other aspect ratios
    return {
      unit: "%",
      width: 80,
      height: 80 / aspect,
      x: 10,
      y: 10,
    }
  }, [aspect])

  const [crop, setCrop] = useState<Crop>(getInitialCrop())
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = React.useRef<HTMLImageElement>(null)

  const handleReset = useCallback(() => {
    setCrop(getInitialCrop())
    setCompletedCrop(undefined)
  }, [getInitialCrop])

  return (
    <ImageCropContext.Provider
      value={{
        crop,
        setCrop,
        completedCrop,
        setCompletedCrop,
        imgRef,
        aspect,
        file,
        onCrop,
        onReset: handleReset,
      }}
    >
      {children}
    </ImageCropContext.Provider>
  )
}

interface ImageCropContentProps {
  className?: string
}

export function ImageCropContent({ className }: ImageCropContentProps) {
  const { crop, setCrop, setCompletedCrop, imgRef, aspect, file } = useImageCrop()
  const [imgSrc, setImgSrc] = useState<string>("")

  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImgSrc(reader.result?.toString() || "")
    })
    reader.readAsDataURL(file)
  }, [file])

  return (
    <div className={cn("w-full", className)}>
      {imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            alt="Crop"
            src={imgSrc}
            style={{ maxWidth: "100%" }}
          />
        </ReactCrop>
      )}
    </div>
  )
}

export function ImageCropApply() {
  const { completedCrop, imgRef, onCrop } = useImageCrop()

  const handleApply = useCallback(() => {
    if (!completedCrop || !imgRef.current) return

    const canvas = document.createElement("canvas")
    const image = imgRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = completedCrop.width
    canvas.height = completedCrop.height
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedUrl = URL.createObjectURL(blob)
      onCrop(croppedUrl)
    }, "image/jpeg")
  }, [completedCrop, imgRef, onCrop])

  return (
    <Button onClick={handleApply} type="button">
      Appliquer
    </Button>
  )
}

export function ImageCropReset() {
  const { onReset } = useImageCrop()

  return (
    <Button onClick={onReset} type="button" variant="outline">
      Réinitialiser
    </Button>
  )
}
