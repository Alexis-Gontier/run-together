import { create } from "zustand"

type OnboardingState = {
  step: number
  name: string
  email: string
  isStravaConnected: boolean
  setStep: (step: number) => void
  nextStep: () => void
  setName: (name: string) => void
  setEmail: (email: string) => void
  setStravaConnected: (connected: boolean) => void
  init: (params: {
    step: number
    name: string
    email: string
    isStravaConnected: boolean
  }) => void
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  step: 1,
  name: "",
  email: "",
  isStravaConnected: false,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setStravaConnected: (isStravaConnected) => set({ isStravaConnected }),
  init: ({ step, name, email, isStravaConnected }) =>
    set({ step, name, email, isStravaConnected }),
}))
