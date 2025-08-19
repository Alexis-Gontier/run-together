import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/shadcn-ui/card"
import { Plus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon?: React.ReactNode
}

export default function StatCard({
  title,
  value,
  description,
  icon = <Plus size={16} />,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <CardTitle className="text-muted-foreground flex items-start justify-between">
          {title}
          {icon}
        </CardTitle>
        <p className="text-2xl font-semibold">
          {value}
        </p>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}