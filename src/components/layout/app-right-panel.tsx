type AppRightPanelProps = {
  children?: React.ReactNode
}

export function AppRightPanel({ children }: AppRightPanelProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-100 shrink-0 overflow-y-auto lg:block">
      <div className="p-2">{children}</div>
    </aside>
  )
}
