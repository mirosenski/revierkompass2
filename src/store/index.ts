import { create } from 'zustand'

interface Address {
  street: string
  city: string
  zip: string
  lat?: number
  lng?: number
}

interface Store {
  currentStep: number
  startAddress: Address | null
  selectedTargets: string[]
  customTargets: Address[]
  
  setStep: (step: number) => void
  setStartAddress: (address: Address) => void
  addTarget: (id: string) => void
  removeTarget: (id: string) => void
  addCustomTarget: (address: Address) => void
}

export const useStore = create<Store>((set) => ({
  currentStep: 1,
  startAddress: null,
  selectedTargets: [],
  customTargets: [],
  
  setStep: (step) => set({ currentStep: step }),
  setStartAddress: (address) => set({ startAddress: address }),
  addTarget: (id) => set((state) => ({ 
    selectedTargets: [...state.selectedTargets, id] 
  })),
  removeTarget: (id) => set((state) => ({ 
    selectedTargets: state.selectedTargets.filter(t => t !== id) 
  })),
  addCustomTarget: (address) => set((state) => ({ 
    customTargets: [...state.customTargets, address] 
  })),
}))
