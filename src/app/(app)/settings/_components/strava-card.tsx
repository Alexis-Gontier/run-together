"use client"

import { useEffect } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"

import { Button } from "@/components/shadcn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { StravaSyncDialog } from "@/components/ui/strava-sync-dialog"
import { API_ROUTES } from "@/lib/constants/routes"
import { disconnectStravaAction } from "../_actions/disconnect-strava-action"

type StravaConnectionInfo = {
  stravaAthleteId: string
  connectedAt: Date
}

type StravaCardProps = {
  connection: StravaConnectionInfo | null
  webhookActive: boolean
  error?: string
}

function StravaLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-8 shrink-0"
      aria-hidden
    >
      <path
        d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"
        fill="#FC4C02"
      />
    </svg>
  )
}

function ConnectionBadge({ connected }: { connected: boolean }) {
  if (connected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
        <span className="size-1.5 rounded-full bg-green-500" />
        Connecté
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
      Non connecté
    </span>
  )
}

function WebhookBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
        <span className="size-1.5 rounded-full bg-green-500" />
        Actif
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Inactif
    </span>
  )
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function ConnectedState({
  connection,
  webhookActive,
  onDisconnect,
  isPending,
}: {
  connection: StravaConnectionInfo
  webhookActive: boolean
  onDisconnect: () => void
  isPending: boolean
}) {
  const connectedAt = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(connection.connectedAt))

  return (
    <div className="flex flex-col gap-4">
      <div className="divide-y divide-border rounded-lg border px-4">
        <InfoRow label="Athlète ID">
          <span className="font-mono text-sm font-medium">
            {connection.stravaAthleteId}
          </span>
        </InfoRow>
        <InfoRow label="Connecté le">
          <span className="text-sm font-medium">{connectedAt}</span>
        </InfoRow>
        <InfoRow label="Webhook temps réel">
          <WebhookBadge active={webhookActive} />
        </InfoRow>
      </div>
      <div className="flex items-center gap-2">
        <StravaSyncDialog />
        <Button
          variant="outline"
          size="sm"
          onClick={onDisconnect}
          disabled={isPending}
        >
          {isPending ? "Déconnexion…" : "Déconnecter"}
        </Button>
      </div>
    </div>
  )
}

function DisconnectedState() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Connectez votre compte Strava pour synchroniser automatiquement vos
        activités de course.
      </p>
      <div>
        <Button
          asChild
          size="sm"
          className="bg-[#FC4C02] text-white hover:bg-[#e04300]"
        >
          <a href={API_ROUTES.STRAVA_CONNECT}>Se connecter avec Strava</a>
        </Button>
      </div>
    </div>
  )
}

export function StravaCard({
  connection,
  webhookActive,
  error,
}: StravaCardProps) {
  useEffect(() => {
    if (error === "insufficient_scope") {
      toast.error(
        "Autorisations Strava insuffisantes. Reconnectez votre compte pour accorder l'accès aux activités privées.",
      )
    }
  }, [error])

  const { execute, isPending } = useAction(disconnectStravaAction, {
    onError: () => toast.error("Erreur lors de la déconnexion."),
    onSuccess: () => toast.success("Compte Strava déconnecté."),
  })

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <StravaLogo />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <CardTitle className="text-base">Strava</CardTitle>
            <CardDescription>Synchronisation des activités</CardDescription>
          </div>
          <ConnectionBadge connected={!!connection} />
        </div>
      </CardHeader>
      <CardContent>
        {connection ? (
          <ConnectedState
            connection={connection}
            webhookActive={webhookActive}
            onDisconnect={() => execute()}
            isPending={isPending}
          />
        ) : (
          <DisconnectedState />
        )}
      </CardContent>
    </Card>
  )
}
