import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card"
import { Button } from "@/components/shadcn-ui/button"
import Link from "next/link"

export default function GroupMemberCard({  }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nom de l&apos;utilisateur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-4">
            {/* {user.image ? (
            <Image
                src={user.image}
                alt={user.displayUsername}
                width={40}
                height={40}
                className="rounded-full object-cover size-8"
            /> */}
            {/* // ) : ( */}
            <div className="uppercase flex items-center justify-center size-8 rounded-full bg-background text-secondary-foreground font-semibold">
                {/* {user.displayUsername[0]} */}
                A
            </div>
            {/* // )} */}
            <div>
                <p className="font-bold">Algont</p>
            </div>
        </div>
        <Button
            variant="outline"
            className="w-full cursor-pointer"
            asChild
        >
            <Link href={`friends/Algont`}>
                Voir le profil
            </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
