import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from "@/components/shadcn-ui/card"
import { SquareDashed } from "lucide-react"

type StatCardProps = {
  title?: string
  value?: string
  description?: string | React.ReactNode
  icon?: React.ReactNode
}

export default function StatCard({
    title = "title",
    value = "N/A",
    description = "description",
    icon = <SquareDashed size={16} />,
}: StatCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-start justify-between">
                    {title}
                    {icon}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                    <p className="text-2xl font-bold">
                        {value}
                    </p>
                    <div className="text-xs text-muted-foreground">
                        {description}
                    </div>
            </CardContent>
        </Card>
    )
}