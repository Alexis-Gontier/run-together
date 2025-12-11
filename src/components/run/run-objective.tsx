import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/shadcn-ui/card"
import { Progress } from "@/components/shadcn-ui/progress"
import { Separator } from "../shadcn-ui/separator"

export function RunObjective() {
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
            {/* <Separator /> */}
            <CardContent className="space-y-1">
                <div className="flex items-center justify-between">
                    <p className="text-md font-semibold">Distance mensuelle</p>
                    <p>Plus que 12 jours</p>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-md font-semibold">45.4 / 100 km</p>
                    <p>45%</p>
                </div>
                <Progress
                    value={45}
                    className="mt-4"
                />
            </CardContent>
        </Card>
    )
}
