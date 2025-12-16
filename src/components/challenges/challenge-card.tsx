import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/shadcn-ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn-ui/avatar"
import { Badge } from "@/components/shadcn-ui/badge"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

type ChallengeCardProps = {
    user: {
        id: string
        name: string
        displayUsername: string | null
        image: string | null
        challenges: Array<{
            id: string
            title: string
            description: string
            isCompleted: boolean
            createdAt: Date
        }>
        gages: Array<{
            id: string
            title: string
            description: string
            isCompleted: boolean
            expiresAt: Date
            completedAt: Date | null
        }>
    }
}

export default function ChallengeCard({ user }: ChallengeCardProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    const activeChallenges = user.challenges.filter(c => !c.isCompleted)
    const completedChallenges = user.challenges.filter(c => c.isCompleted)
    const activeGages = user.gages.filter(g => !g.isCompleted)
    const completedGages = user.gages.filter(g => g.isCompleted)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                        <AvatarImage
                            src={user.image || undefined}
                            alt={user.displayUsername || user.name}
                        />
                        <AvatarFallback>
                            {getInitials(user.displayUsername || user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">
                            {user.displayUsername || user.name}
                        </CardTitle>
                        <CardDescription>
                            {activeChallenges.length} défi(s) en cours · {activeGages.length} gage(s) actif(s)
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Défis actifs */}
                {activeChallenges.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Circle className="size-4" />
                            Défis en cours
                        </h4>
                        <div className="space-y-2">
                            {activeChallenges.map((challenge) => (
                                <div
                                    key={challenge.id}
                                    className="border rounded-lg p-3 space-y-1"
                                >
                                    <p className="font-medium text-sm">{challenge.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {challenge.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Défis complétés */}
                {completedChallenges.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-green-500" />
                            Défis complétés
                        </h4>
                        <div className="space-y-2">
                            {completedChallenges.map((challenge) => (
                                <div
                                    key={challenge.id}
                                    className="border border-green-500 bg-green-5 rounded-lg p-3 space-y-1"
                                >
                                    <p className="font-medium text-sm">{challenge.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {challenge.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Gages actifs */}
                {activeGages.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-destructive">
                            <AlertCircle className="size-4" />
                            Gages actifs
                        </h4>
                        <div className="space-y-2">
                            {activeGages.map((gage) => (
                                <div
                                    key={gage.id}
                                    className="border border-destructive/50 rounded-lg p-3 space-y-1 bg-destructive/5"
                                >
                                    <p className="font-medium text-sm">{gage.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {gage.description}
                                    </p>
                                    {/* <p className="text-xs text-destructive">
                                        Expire {formatDistanceToNow(new Date(gage.expiresAt), {
                                            addSuffix: true,
                                            locale: fr,
                                        })}
                                    </p> */}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* État vide */}
                {activeChallenges.length === 0 &&
                 activeGages.length === 0 &&
                 completedChallenges.length === 0 &&
                 completedGages.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-4">
                        Aucun défi ou gage pour le moment
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
