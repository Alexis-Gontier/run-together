import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/shadcn-ui/card"
import { Progress } from "@/components/shadcn-ui/progress"
import { getMonthStatsAction } from "@/lib/actions/objectives"
import Link from "next/link"
import { Button } from "@/components/shadcn-ui/button"
import { Settings } from "lucide-react"

export async function RunObjective() {
    const result = await getMonthStatsAction();
    const stats = result.data?.data;

    if (!stats || !stats.objective) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>
                        Objectifs du Mois
                    </CardTitle>
                    <CardDescription>
                        Atteignez vos objectifs de course pour rester en forme !
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Vous n&apos;avez pas encore défini d&apos;objectif mensuel.
                    </p>
                    <Link href="/dashboard/settings/goals">
                        <Button variant="outline" size="sm">
                            <Settings className="size-4 mr-2" />
                            Définir un objectif
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const { totalDistance, objective, daysRemaining } = stats;
    const progress = Math.min((totalDistance / objective) * 100, 100);
    const progressRounded = Math.round(progress);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Objectifs du Mois
                </CardTitle>
                <CardDescription>
                    Atteignez vos objectifs de course pour rester en forme !
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-md font-semibold">Distance mensuelle</p>
                    <p className="text-sm text-muted-foreground">
                        {daysRemaining > 0
                            ? `Plus que ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}`
                            : "Dernier jour !"}
                    </p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-md font-semibold">
                        {totalDistance} / {objective} km
                    </p>
                    <p className="text-sm text-muted-foreground">{progressRounded}%</p>
                </div>
                <Progress
                    value={progress}
                    className="mt-4"
                />
                {progress >= 100 && (
                    <p className="text-sm text-green-600 font-semibold mt-2">
                        🎉 Objectif atteint ! Félicitations !
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
