import type { Metadata } from "next"

type ProfileLayoutProps = {
  children: React.ReactNode
  params: Promise<{ username: string }>
}

export async function generateMetadata({
  params,
}: ProfileLayoutProps): Promise<Metadata> {
  const { username } = await params
  return { title: username }
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return children
}
