import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface LeaderboardState {
  period: string
  setPeriod: (period: string) => void
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      period: '30',
      setPeriod: (period) => set({ period }),
    }),
    {
      name: 'leaderboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
