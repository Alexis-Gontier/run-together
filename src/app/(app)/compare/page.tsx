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
import { PR_DISTANCE_LABELS } from "@/lib/runs/pr-display"
import { cn } from "@/lib/utils/cn"
import { formatRunDurationDisplay, formatRunPace } from "@/lib/utils/run"
import { CompareChart } from "./_components/compare-chart"
import { MemberSelect } from "./_components/member-select"
import {
  COMPARE_PERIODS,
  type ComparePeriod,
  getComparison,
} from "./_utils/comparison"

type Props = {
  searchParams: Promise<{ with?: string; period?: string }>
}

const fmt = (v: number) => String(v).replace(".", ",")

/** Une ligne « moi | métrique | l'autre », le meilleur des deux mis en avant. */
function Row({
  label,
  me,
  other,
  // Pour l'allure et les records, plus petit = mieux.
  lowerIsBetter = false,
  display,
}: {
  label: string
  me: number | null
  other: number | null
  lowerIsBetter?: boolean
  display: (v: number) => string
}) {
  const best =
    me === null || other === null || me === other
      ? null
      : (lowerIsBetter ? me < other : me > other)
        ? "me"
        : "other"
  const cell = (v: number | null, side: "me" | "other") => (
    <span
      className={cn(
        "tabular-nums",
        best === side
          ? "font-semibold text-emerald-500"
          : "text-muted-foreground",
      )}
    >
      {v === null || v === 0 ? "—" : display(v)}
    </span>
  )
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2.5 text-sm">
      <span className="text-right">{cell(me, "me")}</span>
      <span className="w-28 text-center text-muted-foreground text-xs">
        {label}
      </span>
      <span>{cell(other, "other")}</span>
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
    orderBy: { name: "asc" },
    select: { id: true, name: true, username: true },
  })
  const other = members.find((m) => m.username === withUsername?.toLowerCase())

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MemberSelect
          members={members.map((m) => ({
            username: m.username ?? "",
            name: m.name,
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
          meName={me.name}
          other={{ id: other.id, name: other.name }}
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
  other: { id: string; name: string }
  period: ComparePeriod
}) {
  const data = await getComparison(meId, other.id, period)

  return (
    <>
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
            <Row
              label="Distance"
              me={data.me.distanceKm}
              other={data.other.distanceKm}
              display={(v) => `${fmt(v)} km`}
            />
            <Row
              label="Courses"
              me={data.me.runs}
              other={data.other.runs}
              display={(v) => String(v)}
            />
            <Row
              label="Allure moyenne"
              me={data.me.pace}
              other={data.other.pace}
              lowerIsBetter
              display={(v) => `${formatRunPace(v)} /km`}
            />
            <Row
              label="Dénivelé"
              me={data.me.elevation}
              other={data.other.elevation}
              display={(v) => `${v} m`}
            />
            <Row
              label="Plus longue"
              me={data.me.longestKm}
              other={data.other.longestKm}
              display={(v) => `${fmt(v)} km`}
            />
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
            {data.records.map((r) => (
              <Row
                key={r.distance}
                label={PR_DISTANCE_LABELS[r.distance]}
                me={r.me}
                other={r.other}
                lowerIsBetter
                display={formatRunDurationDisplay}
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
