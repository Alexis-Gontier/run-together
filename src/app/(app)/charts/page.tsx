import { Radar } from "lucide-react"
import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn-ui/avatar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn-ui/empty"
import { PeriodToggle } from "@/components/ui/period-toggle"
import { RunnerRadar } from "@/components/ui/runner-radar"
import { YouBadge } from "@/components/ui/you-badge"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { compareRoute, profileRoute } from "@/lib/constants/routes"
import { parseStatsPeriod, STATS_PERIODS } from "@/lib/stats/periods"
import {
  parseRadarStats,
  RADAR_STATS,
  radarRating,
  radarScores,
} from "@/lib/stats/radar"
import { getRunnerProfiles } from "@/lib/stats/radar-queries"
import { cn } from "@/lib/utils/cn"
import { displayName } from "@/lib/utils/display-name"
import { getInitials } from "@/lib/utils/get-initials"
import { StatsPicker } from "./_components/stats-picker"

type Props = {
  searchParams: Promise<{ period?: string; stats?: string }>
}

export default async function ChartsPage({ searchParams }: Props) {
  const { period: rawPeriod, stats } = await searchParams
  const period = parseStatsPeriod(rawPeriod)
  const keys = parseRadarStats(stats)
  const [me, profiles] = await Promise.all([
    getRequiredUser(),
    getRunnerProfiles(period),
  ])

  const scores = radarScores(
    profiles.map((p) => p.totals),
    keys,
  )
  const ranked = profiles
    .map((p, i) => ({
      ...p,
      scores: scores[i],
      rating: radarRating(scores[i]),
    }))
    .sort((a, b) => b.rating - a.rating)
  // Libellés seuls : les `format` (fonctions) ne passent pas au composant client.
  const axes = keys.map((k) => ({
    short: RADAR_STATS[k].short,
    label: RADAR_STATS[k].label,
  }))

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodToggle value={period} options={STATS_PERIODS} />
        <StatsPicker value={keys} />
      </div>

      {ranked.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Radar />
            </EmptyMedia>
            <EmptyTitle>Aucune course sur la période</EmptyTitle>
            <EmptyDescription>
              Choisis une période plus longue pour voir les radars du groupe.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2">
          {ranked.map((p, rank) => {
            const isMe = p.user.id === me.id
            const name = displayName(p.user)
            const username = p.user.username ?? ""
            return (
              <li key={p.user.id}>
                <Link
                  href={isMe ? profileRoute(username) : compareRoute(username)}
                  className="block h-full"
                >
                  <Card
                    className={cn(
                      "h-full transition-colors hover:bg-accent/40",
                      isMe && "border-primary",
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="w-4 text-center text-muted-foreground text-sm tabular-nums">
                          {rank + 1}
                        </span>
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage src={p.user.image ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 space-y-0.5">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="truncate">{name}</span>
                            {isMe && <YouBadge />}
                          </CardTitle>
                          <CardDescription className="tabular-nums">
                            {p.totals.runs} course
                            {p.totals.runs > 1 ? "s" : ""} ·{" "}
                            {RADAR_STATS.distance.format(p.totals.distance)}
                          </CardDescription>
                        </div>
                      </div>
                      <CardAction
                        className="font-semibold text-lg tabular-nums"
                        title="Aire du radar, sur 100"
                      >
                        {p.rating}
                      </CardAction>
                    </CardHeader>
                    <CardContent>
                      <RunnerRadar
                        className="h-52"
                        axes={axes}
                        series={[
                          {
                            key: "runner",
                            name,
                            color: "var(--chart-1)",
                            scores: p.scores,
                            texts: keys.map((k) => {
                              const v = p.totals[k]
                              return v === null || v === 0
                                ? "—"
                                : RADAR_STATS[k].format(v)
                            }),
                          },
                        ]}
                      />
                    </CardContent>
                  </Card>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
