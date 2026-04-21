type ProfilePageProps = {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">@{username}</p>
    </div>
  )
}
