import Image from 'next/image'
import { APP_LOGO } from '@/utils/constants'

export default function AppBranding() {
  return (
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
  )
}
