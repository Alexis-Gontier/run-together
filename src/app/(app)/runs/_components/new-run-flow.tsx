"use client"

import { useState } from "react"
import type { RunWithUser } from "@/components/ui/run-card"
import type { TrackSummary } from "@/lib/runs/track/types"
import { BulkImport } from "./bulk-import"
import { RunForm } from "./run-form"
import { RunIntake } from "./run-intake"
import { TrackFileHelp } from "./track-file-help"

type Step =
  | { kind: "intake" }
  | { kind: "manual" }
  // Objet gardé tel quel : une référence stable évite de réinitialiser le formulaire.
  | { kind: "file"; imported: { summary: TrackSummary; fileName: string } }
  | { kind: "bulk"; files: File[] }

/**
 * Ajout d'une course : on dépose d'abord (ou on choisit la saisie manuelle), puis on vérifie
 * dans le formulaire — ou on suit l'import en masse.
 */
export function NewRunFlow({
  user,
  defaultPublish,
}: {
  user: RunWithUser["user"]
  defaultPublish: boolean
}) {
  const [step, setStep] = useState<Step>({ kind: "intake" })
  const restart = () => setStep({ kind: "intake" })

  if (step.kind === "intake")
    return (
      <div className="flex flex-col gap-6">
        <RunIntake
          onParsed={(summary, fileName) =>
            setStep({ kind: "file", imported: { summary, fileName } })
          }
          onBulk={(files) => setStep({ kind: "bulk", files })}
          onManual={() => setStep({ kind: "manual" })}
        />
        {/* Sur grand écran, l'aide est dans le panneau de droite. */}
        <TrackFileHelp className="lg:hidden" />
      </div>
    )

  if (step.kind === "bulk")
    return <BulkImport files={step.files} onRestart={restart} />

  return (
    <RunForm
      user={user}
      defaultPublish={defaultPublish}
      imported={step.kind === "file" ? step.imported : undefined}
      onCancel={restart}
    />
  )
}
