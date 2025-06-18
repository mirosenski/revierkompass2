import { useState } from 'react'
import { useStore } from '../store/index'
import { AddressAutocomplete } from '../components/AddressAutocomplete'
import { MapPin } from 'lucide-react'

export function Step1() {
  const [address, setAddress] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const { setStartAddress, setStep } = useStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address && coordinates) {
      setStartAddress({ 
        street: address, 
        city: '', 
        zip: '',
        lat: coordinates.lat,
        lng: coordinates.lng
      })
      setStep(2)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-police-blue/10 rounded-full mb-4">
          <MapPin className="h-8 w-8 text-police-blue" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Wo starten Sie?</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Geben Sie Ihre Startadresse ein, um die nächsten Polizeireviere zu finden
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AddressAutocomplete
          value={address}
          onChange={(addr, coords) => {
            setAddress(addr)
            setCoordinates(coords || null)
          }}
        />

        {coordinates && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-800 dark:text-green-200">
            ✓ Adresse erkannt: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </div>
        )}

        <button
          type="submit"
          disabled={!coordinates}
          className={`w-full py-3 rounded-lg font-medium transition ${
            coordinates
              ? 'bg-police-blue text-white hover:bg-police-blue/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Weiter zur Zielauswahl
        </button>
      </form>
    </div>
  )
}
