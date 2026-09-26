import { Plus, Route } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn-ui/empty"
import { WeekSummaryCard } from "@/components/ui/week-summary-card"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { ROUTES } from "@/lib/constants/routes"
import { getFeedAction } from "./_actions/get-feed-action"
import { FeedList } from "./_components/feed-list"
import { FeedScopeTabs } from "./_components/feed-scope-tabs"

type Props = {
  searchParams: Promise<{ feed?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { feed } = await searchParams
  const scope = feed === "me" ? "me" : "all"
  const [result, user] = await Promise.all([
    getFeedAction({ limit: 5, scope }),
    getRequiredUser(),
  ])
  const runs = result?.data?.runs ?? []
  const nextCursor = result?.data?.nextCursor ?? null

  return (
    <>
      {/* Le panneau droit est masqué sous lg : « Ma semaine » remonte en tête du fil. */}
      <div className="border-b p-4 lg:hidden">
        <WeekSummaryCard userId={user.id} />
      </div>
      <div className="border-b px-4 pt-2">
        <FeedScopeTabs value={scope} />
      </div>
      {runs.length === 0 ? (
        <Empty className="m-4 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Route />
            </EmptyMedia>
            <EmptyTitle>
              {scope === "me"
                ? "Aucune course pour l'instant"
                : "Le fil est vide"}
            </EmptyTitle>
            <EmptyDescription>
              Ajoute ta première course : saisie manuelle ou fichier GPX/FIT.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href={ROUTES.RUN_NEW}>
                <Plus />
                Ajouter une course
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        // `key` : changer d'onglet repart d'une liste neuve (curseur de pagination compris).
        <FeedList
          key={scope}
          initialRuns={runs}
          initialNextCursor={nextCursor}
          scope={scope}
        />
      )}
    </>
  )
}
