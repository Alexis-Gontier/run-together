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
import { getRequiredUser } from "@/lib/auth/auth-session"
import { prisma } from "@/lib/db/prisma"
import { cn } from "@/lib/utils/cn"
import { displayName } from "@/lib/utils/display-name"
import { BattleScoreboard } from "./_components/battle-scoreboard"
import { CompareChart } from "./_components/compare-chart"
import { MemberSelect } from "./_components/member-select"
import { type BattleLine, computeBattle, type Side } from "./_utils/battle"
import {
  COMPARE_PERIODS,
  type ComparePeriod,
  getComparison,
} from "./_utils/comparison"

type Props = {
  searchParams: Promise<{ with?: string; period?: string }>
}

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
        "inline-flex items-center gap-1.5 tabular-nums",
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

export default async function ComparePage({ searchParams }: Props) {
  const { with: withUsername, period: rawPeriod } = await searchParams
  const period =
    COMPARE_PERIODS.find((p) => p.value === rawPeriod)?.value ??
    ("3m" as ComparePeriod)
  const me = await getRequiredUser()

  // Membres qui ont au moins une course, sauf soi-même.
  const members = await prisma.user.findMany({
    where: { id: { not: me.id }, runs: { some: {} }, username: { not: null } },
    orderBy: { username: "asc" },
    select: { id: true, name: true, username: true },
  })
  const other = members.find((m) => m.username === withUsername?.toLowerCase())

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MemberSelect
          members={members.map((m) => ({
            username: m.username ?? "",
            name: displayName(m),
          }))}
          value={other?.username ?? null}
        />
        <PeriodToggle value={period} options={COMPARE_PERIODS} />
      </div>

      {!other ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Swords />
            </EmptyMedia>
            <EmptyTitle>Choisis un membre</EmptyTitle>
            <EmptyDescription>
              Compare tes kilomètres, ton allure et tes records avec ceux
              d&apos;un autre coureur du groupe.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ComparisonView
          meId={me.id}
          meName={displayName(me)}
          other={{
            id: other.id,
            name: displayName(other),
            username: other.username ?? "",
          }}
          period={period}
        />
      )}
    </div>
  )
}

async function ComparisonView({
  meId,
  meName,
  other,
  period,
}: {
  meId: string
  meName: string
  other: { id: string; name: string; username: string }
  period: ComparePeriod
}) {
  const data = await getComparison(meId, other.id, period)
  const battle = computeBattle(data)

  return (
    <>
      <BattleScoreboard
        otherName={other.name}
        otherUsername={other.username}
        period={period}
        score={battle.score}
        winner={battle.winner}
      />

      <Card>
        <CardHeader>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <CardTitle className="truncate text-right text-base">Toi</CardTitle>
            <span className="w-28 text-center text-muted-foreground text-xs">
              vs
            </span>
            <CardTitle className="truncate text-base">{other.name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {battle.stats.map((l) => (
              <Row key={l.label} line={l} />
            ))}
          </ul>
        </CardContent>
      </Card>

      {data.weekly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume hebdomadaire</CardTitle>
            <CardDescription>Kilomètres par semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <CompareChart
              data={data.weekly}
              meName={meName}
              otherName={other.name}
            />
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
