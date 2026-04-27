"use client"

import { Activity, ArrowRight, Route, Trophy, Users } from "lucide-react"

import { Button } from "@/components/shadcn-ui/button"

type StepWelcomeProps = {
  onStart: () => void
}

const features = [
  {
    icon: Activity,
    title: "Sync automatique",
    description: "Tes courses Strava importées en temps réel",
  },
  {
    icon: Users,
    title: "Entraîne-toi ensemble",
    description: "Rejoins ta team et partage tes efforts",
  },
  {
    icon: Trophy,
    title: "Suis tes progrès",
    description: "Visualise tes performances dans le temps",
  },
]

export function StepWelcome({ onStart }: StepWelcomeProps) {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-primary/10 ring-2 ring-primary/20">
            <Route className="size-12 text-primary" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            ✓
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">RunTogether</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Entraîne-toi. Partage. Progresse.
          </p>
        </div>
      </div>

      <div className="w-full space-y-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="lg"
        onClick={onStart}
        className="w-full cursor-pointer gap-2"
      >
        Commencer la configuration
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
