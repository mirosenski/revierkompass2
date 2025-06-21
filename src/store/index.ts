import { create } from 'zustand'

interface Address {
  street: string
  lat: number
  lng: number
}

interface Store {
  currentStep: number
  startAddress: Address | null
  selectedTargets: string[] // Revier IDs
  customTargets: Address[] // Custom addresses
  results: Array<{
    id: string
    name: string
    distance: number // km
    duration: number // min
  }>
  
  setStep: (step: number) => void
  setStartAddress: (address: Address) => void
  toggleTarget: (id: string) => void
  addCustomTarget: (target: Address) => void
  removeCustomTarget: (index: number) => void
  setResults: (results: any[]) => void
  reset: () => void
}

export const useStore = create<Store>((set) => ({
  currentStep: 1,
  startAddress: null,
  selectedTargets: [],
  customTargets: [],
  results: [],
  
  setStep: (step) => set({ currentStep: step }),
  setStartAddress: (address) => set({ startAddress: address }),
  toggleTarget: (id) => set((state) => ({
    selectedTargets: state.selectedTargets.includes(id)
      ? state.selectedTargets.filter(t => t !== id)
      : [...state.selectedTargets, id]
  })),
  addCustomTarget: (target) => set((state) => ({
    customTargets: [...state.customTargets, target]
  })),
  removeCustomTarget: (index) => set((state) => ({
    customTargets: state.customTargets.filter((_, i) => i !== index)
  })),
  setResults: (results) => set({ results }),
  reset: () => set({
    currentStep: 1,
    startAddress: null,
    selectedTargets: [],
    customTargets: [],
    results: []
  })
}))
