"use client"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shadcn-ui/tabs"
import { ProfileRunsList } from "./profile-runs-list"
import { ProfileRecords } from "./profile-records"
import type { getProfileRunsAction } from "../_actions/get-profile-runs-action"
import type { getProfileAction } from "../_actions/get-profile-action"

type Run = NonNullable<
  Awaited<ReturnType<typeof getProfileRunsAction>>["data"]
>["runs"][number]

type Record = NonNullable<
  NonNullable<Awaited<ReturnType<typeof getProfileAction>>["data"]>["records"]
>[number]

interface ProfileTabsProps {
  username: string
  initialRuns: Run[]
  initialNextCursor: string | null
  records: Record[]
}

export function ProfileTabs({
  username,
  initialRuns,
  initialNextCursor,
  records,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="courses">
      <TabsList variant="line" className="w-full">
        <TabsTrigger value="courses" className="cursor-pointer">
          Courses
        </TabsTrigger>
        <TabsTrigger value="records" className="cursor-pointer">
          Records
        </TabsTrigger>
      </TabsList>
      <TabsContent value="courses" className="mt-0">
        <ProfileRunsList
          username={username}
          initialRuns={initialRuns}
          initialNextCursor={initialNextCursor}
        />
      </TabsContent>
      <TabsContent value="records" className="mt-0 p-4">
        <ProfileRecords records={records} />
      </TabsContent>
    </Tabs>
  )
}
