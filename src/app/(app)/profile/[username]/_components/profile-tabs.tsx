"use client"

import { Footprints } from "lucide-react"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/shadcn-ui/empty"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs"

function EmptyState({ label }: { label: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Footprints />
        </EmptyMedia>
        <EmptyDescription>{label}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function ProfileTabs() {
  return (
    <Tabs defaultValue="courses">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="courses" className="cursor-pointer">
          Courses
        </TabsTrigger>
        <TabsTrigger value="stats" className="cursor-pointer">
          Stats
        </TabsTrigger>
      </TabsList>
      <TabsContent value="courses" className="mt-0">
        <EmptyState label="Aucune course pour le moment." />
      </TabsContent>
      <TabsContent value="stats" className="mt-0">
        <EmptyState label="Aucune statistique pour le moment." />
      </TabsContent>
    </Tabs>
  )
}
