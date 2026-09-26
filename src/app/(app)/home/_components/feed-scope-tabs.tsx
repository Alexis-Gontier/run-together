"use client"

import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn-ui/tabs"
import type { FeedScope } from "../_schemas/feed-schema"

export function FeedScopeTabs({ value }: { value: FeedScope }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  return (
    <Tabs
      value={value}
      onValueChange={(next) =>
        startTransition(() =>
          router.push(next === "me" ? `${pathname}?feed=me` : pathname),
        )
      }
      className={isPending ? "opacity-60" : undefined}
    >
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="all" className="flex-1 cursor-pointer">
          Tout le monde
        </TabsTrigger>
        <TabsTrigger value="me" className="flex-1 cursor-pointer">
          Moi
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
