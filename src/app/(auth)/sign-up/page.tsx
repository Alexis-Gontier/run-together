import {
  Card,
  CardContent,
} from "@/components/shadcn-ui/card"
import { SignUpForm } from "./sign-up-form"
import { env } from "@/utils/env"
import { notFound } from "next/navigation"

export default function SignUpPage() {

  if (env.NODE_ENV === "production") {
    notFound()
  }

  return (
    <Card className="w-full">
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  )
}
