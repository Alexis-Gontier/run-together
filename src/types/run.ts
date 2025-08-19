export type Run = {
  id: string
  userId: string
  date: Date
  distance: number
  duration: number
  elevation: number | null
  location: string | null
  notes: string | null
}

export type RunTableData = {
  id: string
  date: Date
  distance: number
  duration: number
  elevation: number | null
  location: string | null
  notes: string | null
}