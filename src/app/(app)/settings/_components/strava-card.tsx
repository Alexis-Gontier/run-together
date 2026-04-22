"use client"

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
}

function StravaLogo() {
  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-sm font-black text-white"
      style={{ backgroundColor: "#FC4C02" }}
      aria-hidden
    >
      S
    </div>
  )
}

function ConnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
      <span className="size-1.5 rounded-full bg-green-500" />
      Connecté
    </span>
  )
}

function DisconnectedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
      Non connecté
    </span>
  )
}

function ConnectedState({
  connection,
  onDisconnect,
  isPending,
}: {
  connection: StravaConnectionInfo
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
      <div className="flex items-center gap-3">
        <ConnectedBadge />
      </div>
      <div className="grid gap-1 text-sm text-muted-foreground">
        <span>
          Athlète ID :{" "}
          <span className="font-medium text-foreground">
            {connection.stravaAthleteId}
          </span>
        </span>
        <span>
          Connecté le :{" "}
          <span className="font-medium text-foreground">{connectedAt}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <StravaSyncDialog />
        <Button variant="outline" onClick={onDisconnect} disabled={isPending}>
          {isPending ? "Déconnexion…" : "Déconnecter"}
        </Button>
      </div>
    </div>
  )
}

function DisconnectedState() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <DisconnectedBadge />
      </div>
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

export function StravaCard({ connection }: StravaCardProps) {
  const { execute, isPending } = useAction(disconnectStravaAction, {
    onError: () => toast.error("Erreur lors de la déconnexion."),
    onSuccess: () => toast.success("Compte Strava déconnecté."),
  })

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <StravaLogo />
        <div>
          <CardTitle className="text-base">Strava</CardTitle>
          <CardDescription>Synchronisation des activités</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {connection ? (
          <ConnectedState
            connection={connection}
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
