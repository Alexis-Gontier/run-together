import { LoaderCircle } from 'lucide-react'

export default function loading() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <LoaderCircle className="h-12 w-12 animate-spin" />
    </div>
  )
}