import TextHeading from '@/components/ui/text-heading'
import { UpdateRunForm } from './edit-form'
import { Separator } from '@/components/shadcn-ui/separator'
import { prisma } from "@/lib/prisma"
import { getUser } from "@/lib/auth-server"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRunPage({ params }: PageProps) {
  const user = await getUser()
  if (!user) notFound()

  const { id } = await params;
  const run = await prisma.run.findFirst({
    where: {
      id,
      userId: user.id,
    },
  })

  if (!run) {
    notFound()
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <TextHeading
        title="Modifier une course"
        description="Mettez à jour les informations de la course ci-dessous."
      />
      <Separator />
      <UpdateRunForm run={run} />
    </div>
  )
}