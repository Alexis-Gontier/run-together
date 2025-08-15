import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LeaderboardState {
  selectedDays: string
  setSelectedDays: (value: string) => void
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      selectedDays: "30", // valeur par défaut
      setSelectedDays: (value) => set({ selectedDays: value }),
    }),
    {
      name: "leaderboard-storage", // nom de la clé dans localStorage
    }
  )
)
