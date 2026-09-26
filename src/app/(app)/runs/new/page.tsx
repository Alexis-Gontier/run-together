import type { Metadata } from "next"
import { getRequiredUser } from "@/lib/auth/auth-session"
import { RunForm } from "../_components/run-form"

export const metadata: Metadata = {
  title: "Ajouter une course",
}

export default async function NewRunPage() {
  await getRequiredUser()

  return (
    <div className="p-4">
      <RunForm />
    </div>
  )
}
