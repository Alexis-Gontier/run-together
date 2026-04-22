"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn-ui/select"

const subscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useIsMounted()

  if (!mounted) {
    return <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
  }

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        <SelectItem value="light">Clair</SelectItem>
        <SelectItem value="dark">Sombre</SelectItem>
        <SelectItem value="system">Système</SelectItem>
      </SelectContent>
    </Select>
  )
}
