import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/shadcn-ui/card"
import { SignInForm } from "./sign-in-form"
import Image from "next/image"
import { APP_LOGO } from "@/utils/constants"
import { Separator } from "@/components/shadcn-ui/separator"
import { Button } from "@/components/shadcn-ui/button"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="space-y-4 w-full">
      <h1 className="flex items-center justify-center gap-2">
        <Image
          priority
          src={APP_LOGO}
          alt="logo"
          width={36}
          height={36}
        />
        <span className="font-medium">RunTogether.</span>
      </h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="">Connexion</CardTitle>
          <CardDescription>Connectez-vous à votre compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <SignInForm />
          <Separator />
          <Button
            className="w-full cursor-pointer"
            variant="outline"
          >
            Mot de passe oublié ?
          </Button>
        </CardContent>
      </Card>
      <div className="text-center text-xs px-6 text-muted-foreground">
        En continuant, vous acceptez <Link href="" className="underline">nos Conditions d&apos;utilisation</Link> et notre <Link href="" className="underline">Politique de confidentialité</Link>
      </div>
    </div>
  )
}
