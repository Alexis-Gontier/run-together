type AppRightPanelProps = {
  children?: React.ReactNode
}

export function AppRightPanel({ children }: AppRightPanelProps) {
  return <aside className="hidden w-80 shrink-0 lg:block">{children}</aside>
}
