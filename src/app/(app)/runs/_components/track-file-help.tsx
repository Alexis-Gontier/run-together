import { CircleHelp } from "lucide-react"
import type { ReactNode } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn-ui/accordion"

type Guide = { id: string; title: string; steps: ReactNode[]; note?: ReactNode }

const STRAVA_ONE: Guide = {
  id: "strava-one",
  title: "Strava — une course",
  steps: [
    <>
      Sur <strong>strava.com</strong> (le site, pas l&apos;appli mobile), ouvre
      l&apos;activité.
    </>,
    <>
      Menu <strong>« … »</strong> à gauche →{" "}
      <strong>« Exporter l&apos;original »</strong> (fichier .fit ou .tcx de la
      montre).
    </>,
  ],
  note: "Préfère « Exporter l'original » à « Exporter en GPX » : il garde la distance de la montre, la FC et la cadence.",
}

const STRAVA_ALL: Guide = {
  id: "strava-all",
  title: "Strava — tout l'historique",
  steps: [
    <>
      Sur <strong>strava.com</strong> : <strong>Paramètres</strong> →{" "}
      <strong>Mon compte</strong> →{" "}
      <strong>« Télécharger ou supprimer votre compte »</strong> →{" "}
      <strong>Commencer</strong>.
    </>,
    <>
      Étape 2 : <strong>« Demander votre archive »</strong>. Strava envoie un
      lien par e-mail (compter quelques heures).
    </>,
    <>
      Dézippe l&apos;archive, puis{" "}
      <strong>« Choisir le dossier de l&apos;archive Strava »</strong> et
      sélectionne le dossier dézippé (les .gz sont acceptés tels quels).
    </>,
  ],
  note: "Le fichier activities.csv de l'archive sert à écarter vélo, marche… et à garder tes titres Strava. Sans lui (fichiers déposés à la main), ajoute-le à ta sélection.",
}

const AMAZFIT: Guide = {
  id: "amazfit",
  title: "Amazfit (Zepp)",
  steps: [
    <>
      Dans l&apos;appli <strong>Zepp</strong> : <strong>Profil</strong> →{" "}
      <strong>Ajouter des comptes</strong> → <strong>Strava</strong>, pour que
      chaque séance y soit envoyée.
    </>,
    <>Puis récupère le fichier depuis Strava (voir ci-dessus).</>,
  ],
  note: "Zepp n'exporte pas toujours les fichiers directement : passer par Strava est le plus fiable.",
}

const GARMIN: Guide = {
  id: "garmin",
  title: "Garmin",
  steps: [
    <>
      Une course : sur <strong>connect.garmin.com</strong>, ouvre
      l&apos;activité → icône <strong>⚙</strong> →{" "}
      <strong>« Exporter l&apos;original »</strong> (zip contenant le .fit, à
      dézipper).
    </>,
    <>
      Tout l&apos;historique : compte Garmin →{" "}
      <strong>Gestion des données</strong> →{" "}
      <strong>« Exporter vos données »</strong>, lien reçu par e-mail.
    </>,
  ],
}

const OTHERS: Guide = {
  id: "others",
  title: "Coros, Polar, Apple Watch et autres",
  steps: [
    <>
      <strong>Coros</strong> : Training Hub (site web) ou appli → activité →
      export .fit.
    </>,
    <>
      <strong>Polar</strong> : flow.polar.com → séance →{" "}
      <strong>Exporter la séance</strong> (.tcx ou .gpx).
    </>,
    <>
      <strong>Apple Watch</strong> : pas d&apos;export natif ; une appli comme
      HealthFit ou RunGap exporte les séances en .fit.
    </>,
    <>
      Autre montre (Suunto…) : synchronise-la avec Strava et exporte depuis
      Strava.
    </>,
  ],
}

const GUIDES = {
  single: [STRAVA_ONE, AMAZFIT, GARMIN, OTHERS],
  bulk: [STRAVA_ALL, GARMIN, AMAZFIT, OTHERS],
}

/** Aide repliable : comment récupérer ses fichiers selon la montre ou l'appli. */
export function TrackFileHelp({ mode }: { mode: "single" | "bulk" }) {
  return (
    <div className="rounded-lg border px-4">
      <p className="flex items-center gap-2 pt-4 font-medium text-sm">
        <CircleHelp className="size-4 text-muted-foreground" />
        Comment récupérer mes fichiers ?
      </p>
      <Accordion type="single" collapsible>
        {GUIDES[mode].map((g) => (
          <AccordionItem key={g.id} value={g.id}>
            <AccordionTrigger className="cursor-pointer">
              {g.title}
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-muted-foreground">
              <ol className="list-decimal space-y-1.5 pl-5">
                {g.steps.map((step, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: liste statique
                  <li key={i}>{step}</li>
                ))}
              </ol>
              {g.note && <p className="text-xs">{g.note}</p>}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
