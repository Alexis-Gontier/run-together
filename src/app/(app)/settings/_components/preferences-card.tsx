import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { DiscordPreferenceSwitch } from "./discord-preference-switch"
import { ThemeToggle } from "./theme-toggle"

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
        <p className="font-medium text-sm">{label}</p>
        {description && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function PreferencesCard({
  publishRunsToDiscord,
}: {
  publishRunsToDiscord: boolean
}) {
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
          label="Publier mes courses sur Discord"
          description="Valeur par défaut à chaque nouvelle course, modifiable course par course."
        >
          <DiscordPreferenceSwitch defaultChecked={publishRunsToDiscord} />
        </PreferenceRow>
      </CardContent>
    </Card>
  )
}
