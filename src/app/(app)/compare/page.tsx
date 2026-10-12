import { Swords } from "lucide-react"
import {
  Card,
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
import { getRequiredUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"
import {
  parseStatsPeriod,
  STATS_PERIODS,
  type StatsPeriod,
  statsPeriodRange,
} from "@/lib/stats/periods"
import {
  DEFAULT_RADAR_STATS,
  RADAR_STATS,
  radarScores,
  runnerTotals,
} from "@/lib/stats/radar"
import { getRunnerProfiles } from "@/lib/stats/radar-queries"
import { cn } from "@/lib/utils/cn"
import { displayName } from "@/lib/utils/display-name"
import { BattleScoreboard } from "./_components/battle-scoreboard"
import { CompareChart } from "./_components/compare-chart"
import { DuelPicker } from "./_components/duel-picker"
import { type BattleLine, computeBattle, type Side } from "./_utils/battle"
import { getComparison } from "./_utils/comparison"

type Props = {
  searchParams: Promise<{ a?: string; with?: string; period?: string }>
}

// Mêmes couleurs que le graphique hebdomadaire.
const ME_COLOR = "#10b981"
const OTHER_COLOR = "#f59e0b"

const Point = () => (
  <span className="rounded bg-emerald-500/15 px-1 font-bold text-[10px] leading-4">
    +1
  </span>
)

/** Une ligne « moi | métrique | l'autre » : celui qui marque le point est mis en avant. */
function Row({ line }: { line: BattleLine }) {
  const cell = (text: string, side: Side) => (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums",
        line.winner === side
          ? "font-semibold text-emerald-500"
          : "text-muted-foreground",
      )}
    >
      {line.winner === side && side === "other" && <Point />}
      {text}
      {line.winner === side && side === "me" && <Point />}
    </span>
  )
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 text-sm">
      <span className="text-right">{cell(line.meText, "me")}</span>
      <span className="w-28 text-center text-muted-foreground text-xs">
        {line.label}
      </span>
      <span>{cell(line.otherText, "other")}</span>
    </li>
  )
}

/** Part des kilomètres de chacun sur la période. */
function ShareBar({ me, other }: { me: number; other: number }) {
  const total = me + other
  if (total === 0) return null
  const pct = Math.round((me / total) * 100)
  return (
    <div className="space-y-1.5 pb-2">
      <div className="flex justify-between text-muted-foreground text-xs tabular-nums">
        <span>{pct} %</span>
        <span>Part des kilomètres</span>
        <span>{100 - pct} %</span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        <div style={{ width: `${pct}%`, background: ME_COLOR }} />
        <div className="flex-1" style={{ background: OTHER_COLOR }} />
      </div>
    </div>
  )
}

/** Barres en miroir : nombre de courses par tranche de distance. */
function DistanceBuckets({
  buckets,
}: {
  buckets: { label: string; me: number; other: number }[]
}) {
  const max = Math.max(1, ...buckets.flatMap((b) => [b.me, b.other]))
  const bar = (n: number, side: Side) => (
    <div
      className={cn(
        "flex items-center gap-1.5",
        side === "me" && "flex-row-reverse",
      )}
    >
      <div
        className="h-3 rounded-sm"
        style={{
          width: `${(n / max) * 100}%`,
          background: side === "me" ? ME_COLOR : OTHER_COLOR,
        }}
      />
      <span className="text-muted-foreground text-xs tabular-nums">{n}</span>
    </div>
  )
  return (
    <ul className="space-y-2">
      {buckets.map((b) => (
        <li
          key={b.label}
          className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
        >
          {bar(b.me, "me")}
          <span className="w-28 text-center text-muted-foreground text-xs">
            {b.label}
          </span>
          {bar(b.other, "other")}
        </li>
      ))}
    </ul>
  )
}

export default async function ComparePage({ searchParams }: Props) {
  const { a, with: withUsername, period: rawPeriod } = await searchParams
  const period = parseStatsPeriod(rawPeriod)
  const me = await getRequiredUser()

  // Membres qui ont au moins une course, et toi dans tous les cas.
  const members = await prisma.user.findMany({
    where: {
      username: { not: null },
      OR: [{ id: me.id }, { runs: { some: {} } }],
    },
    orderBy: { username: "asc" },
    select: {
      id: true,
      name: true,
      username: true,
      displayUsername: true,
      image: true,
    },
  })
  const runners = members.map((m) => ({
    id: m.id,
    username: m.username ?? "",
    name: displayName(m),
    image: m.image,
    isMe: m.id === me.id,
  }))
  const byUsername = (u?: string) =>
    runners.find((r) => r.username === u?.toLowerCase())
  const left = byUsername(a) ?? runners.find((r) => r.isMe)
  const right = byUsername(withUsername)
  const duel = left && right && left.id !== right.id ? { left, right } : null

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-3">
        <DuelPicker
          members={runners.map(({ username, name, isMe }) => ({
            username,
            name,
            isMe,
          }))}
          left={left?.username ?? ""}
          right={duel ? duel.right.username : null}
        />
        <PeriodToggle value={period} options={STATS_PERIODS} />
      </div>

      {!duel ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Swords />
            </EmptyMedia>
            <EmptyTitle>Choisis un membre</EmptyTitle>
            <EmptyDescription>
              Compare les kilomètres, l&apos;allure et les records de deux
              coureurs du groupe — toi ou n&apos;importe qui d&apos;autre.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ComparisonView left={duel.left} right={duel.right} period={period} />
      )}
    </div>
  )
}

type Runner = {
  id: string
  username: string
  name: string
  image: string | null
  isMe: boolean
}

/** « Toi » pour l'utilisateur connecté, son nom sinon. */
const labelOf = (r: Runner) => (r.isMe ? "Toi" : r.name)

async function ComparisonView({
  left,
  right,
  period,
}: {
  left: Runner
  right: Runner
  period: StatsPeriod
}) {
  const [data, profiles] = await Promise.all([
    getComparison(left.id, right.id, period),
    getRunnerProfiles(period),
  ])
  const battle = computeBattle(data)

  // Radar relatif au meilleur du groupe, comme sur /charts.
  const { start, end } = statsPeriodRange(period)
  const empty = runnerTotals([], start, end)
  const totalsOf = (id: string) =>
    profiles.find((p) => p.user.id === id)?.totals ?? empty
  const keys = DEFAULT_RADAR_STATS
  const pair = [totalsOf(left.id), totalsOf(right.id)]
  const scores = radarScores([...profiles.map((p) => p.totals), ...pair], keys)
  const [leftScores, rightScores] = scores.slice(-2)
  const texts = (t: (typeof pair)[number]) =>
    keys.map((k) => {
      const v = t[k]
      return v === null || v === 0 ? "—" : RADAR_STATS[k].format(v)
    })
  const hasRuns = data.me.runs + data.other.runs > 0

  return (
    <>
      <BattleScoreboard
        fighters={{
          me: { ...left, label: labelOf(left) },
          other: { ...right, label: labelOf(right) },
        }}
        publishWith={
          left.isMe ? right.username : right.isMe ? left.username : null
        }
        period={period}
        score={battle.score}
        winner={battle.winner}
      />

      <Card>
        <CardHeader>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <CardTitle className="truncate text-right text-base">
              {labelOf(left)}
            </CardTitle>
            <span className="w-28 text-center text-muted-foreground text-xs">
              vs
            </span>
            <CardTitle className="truncate text-base">
              {labelOf(right)}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ShareBar me={data.me.distanceKm} other={data.other.distanceKm} />
          <ul className="divide-y">
            {battle.stats.map((l) => (
              <Row key={l.label} line={l} />
            ))}
          </ul>
        </CardContent>
      </Card>

      {hasRuns && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
            <CardDescription>
              Chaque axe est relatif au meilleur du groupe sur la période
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RunnerRadar
              className="h-72"
              legend
              axes={keys.map((k) => ({
                short: RADAR_STATS[k].short,
                label: RADAR_STATS[k].label,
              }))}
              series={[
                {
                  key: "me",
                  name: left.name,
                  color: ME_COLOR,
                  scores: leftScores,
                  texts: texts(pair[0]),
                },
                {
                  key: "other",
                  name: right.name,
                  color: OTHER_COLOR,
                  scores: rightScores,
                  texts: texts(pair[1]),
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {data.weekly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume hebdomadaire</CardTitle>
            <CardDescription>Kilomètres par semaine ou cumulés</CardDescription>
          </CardHeader>
          <CardContent>
            <CompareChart
              data={data.weekly}
              meName={left.name}
              otherName={right.name}
            />
          </CardContent>
        </Card>
      )}

      {hasRuns && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distances courues</CardTitle>
            <CardDescription>Nombre de courses par tranche</CardDescription>
          </CardHeader>
          <CardContent>
            <DistanceBuckets buckets={data.buckets} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Records</CardTitle>
          <CardDescription>Meilleurs temps, toutes périodes</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {battle.records.map((l) => (
              <Row key={l.label} line={l} />
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
