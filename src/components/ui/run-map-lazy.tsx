"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/shadcn-ui/skeleton"

// Leaflet touche `window` dès l'import : la carte n'est jamais rendue côté serveur.
export const RunMapLazy = dynamic(() => import("./run-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
})
