import { useState } from 'react'
import { useStore } from '../store/index'
import { Search } from 'lucide-react'

export function Step1() {
  const [address, setAddress] = useState('')
  const { setStartAddress, setStep } = useStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Geocoding
    setStartAddress({ street: address, city: '', zip: '' })
    setStep(2)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Schritt 1: Startadresse eingeben</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Straße, PLZ oder Ort eingeben..."
            className="pl-10 w-full p-3 border rounded-lg dark:bg-gray-800"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-police-blue text-white rounded-lg hover:bg-police-blue/90"
        >
          Weiter
        </button>
      </form>
    </div>
  )
}
