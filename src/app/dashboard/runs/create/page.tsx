import TextHeading from '@/components/ui/text-heading'
import { CreateRunForm } from './create-form'
import { Separator } from '@/components/shadcn-ui/separator'

export default function page() {
  return (
    <>
      <TextHeading
        title="Créer une course"
        description="Remplissez le formulaire ci-dessous pour créer une nouvelle course."
      />
      <Separator />
      <CreateRunForm />
    </>
  )
}
