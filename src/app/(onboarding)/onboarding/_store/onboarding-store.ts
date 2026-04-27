import { create } from "zustand"

type OnboardingState = {
  step: number
  name: string
  email: string
  isStravaConnected: boolean
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
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
  step: 0,
  name: "",
  email: "",
  isStravaConnected: false,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(0, state.step - 1) })),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setStravaConnected: (isStravaConnected) => set({ isStravaConnected }),
  init: ({ step, name, email, isStravaConnected }) =>
    set({ step, name, email, isStravaConnected }),
}))
