import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/shadcn-ui/card"
import { SignInForm } from "./sign-in-form"

export default function SignUpPage() {
  return (
    <Card className="w-full">
      <CardContent>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
