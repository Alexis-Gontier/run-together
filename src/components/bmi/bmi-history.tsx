import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import BmiItem from "./bmi-item"
import { type bmi } from "@/generated/prisma/client"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/shadcn-ui/empty"
import { List } from "lucide-react"

type BmiHistoryProps = {
  metrics: bmi[]
}

export function BmiHistory({ metrics }: BmiHistoryProps) {

    if (metrics.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Historique</CardTitle>
                    <CardDescription>Aucune donnée disponible</CardDescription>
                </CardHeader>
                <CardContent>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia>
                                <List className="text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle className="text-muted-foreground">Aucune mesure de poids</EmptyTitle>
                            <EmptyDescription>
                                Ajoutez des données pour voir votre évolution
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Historique</CardTitle>
                <CardDescription>Vos dernières mesures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
                {metrics.map((item) => (
                    <BmiItem
                        key={item.id}
                        data={item}
                    />
                ))}
            </CardContent>
        </Card>
    )
}