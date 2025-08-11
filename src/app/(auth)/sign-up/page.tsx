import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/shadcn-ui/card"
import { SignUpForm } from "./sign-up-form"

export default function SignUpPage() {
  return (
    <Card className="w-full">
      <CardContent>
        <SignUpForm />
      </CardContent>
    </Card>
  )
}
