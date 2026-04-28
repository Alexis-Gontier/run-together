"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs"
import { ProfileRunsList } from "./profile-runs-list"
import type { getProfileRunsAction } from "../_actions/get-profile-runs-action"

type Run = NonNullable<
  Awaited<ReturnType<typeof getProfileRunsAction>>["data"]
>["runs"][number]

interface ProfileTabsProps {
  username: string
  initialRuns: Run[]
  initialNextCursor: string | null
}

export function ProfileTabs({
  username,
  initialRuns,
  initialNextCursor,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="courses">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="courses" className="cursor-pointer">
          Courses
        </TabsTrigger>
      </TabsList>
      <TabsContent value="courses" className="mt-0">
        <ProfileRunsList
          username={username}
          initialRuns={initialRuns}
          initialNextCursor={initialNextCursor}
        />
      </TabsContent>
    </Tabs>
  )
}
