import type { Metadata } from "next"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { NewRunFlow } from "../_components/new-run-flow"

export const metadata: Metadata = {
  title: "Ajouter une course",
}

export default async function NewRunPage() {
  const user = await getRequiredUser()

  return (
    <div className="p-4">
      <NewRunFlow
        user={{
          name: user.name,
          username: user.username ?? null,
          image: user.image ?? null,
        }}
        defaultPublish={user.publishRunsToDiscord ?? true}
      />
    </div>
  )
}
