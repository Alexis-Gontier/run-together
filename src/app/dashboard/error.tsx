"use client"

import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn-ui/alert'
import { Button } from '@/components/shadcn-ui/button'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="space-y-2">
        <Alert variant="destructive">
            <AlertTitle>Message d&apos;erreur</AlertTitle>
            <AlertDescription>
                {error.message || 'Une erreur inconnue est survenue.'}
            </AlertDescription>
        </Alert>
        <Button
            onClick={() => reset()}
            variant="secondary"
            className="cursor-pointer"
        >
            Rafraîchir la page
        </Button>
    </div>
  )
}