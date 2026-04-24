import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { ThemeToggle } from "./theme-toggle"
import { Switch } from "@/components/shadcn-ui/switch"

function PreferenceRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function PreferencesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Préférences</CardTitle>
        <CardDescription>
          Personnalisez votre expérience sur Run Together.
        </CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <PreferenceRow label="Thème" description="Apparence de l'interface.">
          <ThemeToggle />
        </PreferenceRow>
        <PreferenceRow
          label="Langue"
          description="Langue d'affichage de l'interface."
        >
          <span className="text-sm text-muted-foreground">Français</span>
        </PreferenceRow>
        <PreferenceRow
          label="Unité de distance"
          description="Kilomètres ou miles pour vos activités."
        >
          <span className="text-sm text-muted-foreground">Kilomètres</span>
        </PreferenceRow>
        <PreferenceRow
          label="Notifications"
          description="Recevez des alertes pour les nouvelles activités."
        >
          <Switch className="cursor-pointer" />
        </PreferenceRow>
      </CardContent>
    </Card>
  )
}
