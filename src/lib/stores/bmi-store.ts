import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BmiState {
    weight: number
    height: number
    setWeight: (weight: number) => void
    setHeight: (height: number) => void
    setMetrics: (weight: number, height: number) => void
}

export const useBmiStore = create<BmiState>()(
    persist(
        (set) => ({
            weight: 0,
            height: 0,
            setWeight: (weight) => set({ weight }),
            setHeight: (height) => set({ height }),
            setMetrics: (weight, height) => set({ weight, height }),
        }),
        {
            name: 'bmi-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)