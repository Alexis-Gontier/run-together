import { formatDistanceToNow, subDays } from "date-fns"
import { fr } from "date-fns/locale"
import type { Metadata } from "next"
import { Badge } from "@/components/shadcn-ui/badge"
import { getRequiredAdmin } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"
import { ResendButton } from "./_components/resend-button"
import { TestWebhookButton } from "./_components/test-webhook-button"

export const metadata: Metadata = {
  title: "Discord — Administration",
}

const TYPE_LABELS: Record<string, string> = {
  "run.created": "Course",
  "member.joined": "Bienvenue",
  "recap.weekly": "Récap",
  "badge.unlocked": "Badge",
  test: "Test",
}

export default async function AdminDiscordPage() {
  await getRequiredAdmin()

  const since = subDays(new Date(), 7)
  const [notifications, sent, failed] = await Promise.all([
    prisma.discordNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        dedupeKey: true,
        status: true,
        error: true,
        attempts: true,
        createdAt: true,
      },
    }),
    prisma.discordNotification.count({
      where: { status: "SENT", createdAt: { gte: since } },
    }),
    prisma.discordNotification.count({
      where: { status: "FAILED", createdAt: { gte: since } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">Discord</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            7 derniers jours : {sent} envoyée{sent > 1 ? "s" : ""}, {failed} en
            échec
          </p>
        </div>
        <TestWebhookButton />
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-lg border px-4 py-8 text-center text-muted-foreground text-sm">
          Aucune notification envoyée pour l&apos;instant.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Clé</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {notifications.map((n) => (
                <tr key={n.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">
                    {formatDistanceToNow(n.createdAt, {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </td>
                  <td className="px-4 py-2">{TYPE_LABELS[n.type] ?? n.type}</td>
                  <td className="px-4 py-2 font-mono text-muted-foreground text-xs">
                    {n.dedupeKey}
                    {n.error && (
                      <p className="mt-1 max-w-md break-all font-sans text-destructive">
                        {n.error}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <Badge
                      variant={
                        n.status === "SENT" ? "secondary" : "destructive"
                      }
                    >
                      {n.status === "SENT" ? "Envoyée" : "Échec"}
                    </Badge>
                    {n.attempts > 1 && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        ×{n.attempts}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {n.status === "FAILED" && <ResendButton id={n.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
