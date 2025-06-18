import { useState } from 'react'
import { useStore } from '../store/index'
import { MapPin, Plus, X } from 'lucide-react'

// Dummy Polizeireviere Daten
const POLIZEIREVIERE = [
  { id: '1', name: 'Polizeirevier Stuttgart-Mitte', praesidium: 'Stuttgart', lat: 48.7758, lng: 9.1829 },
  { id: '2', name: 'Polizeirevier Karlsruhe-Marktplatz', praesidium: 'Karlsruhe', lat: 49.0093, lng: 8.4037 },
  { id: '3', name: 'Polizeirevier Mannheim-Innenstadt', praesidium: 'Mannheim', lat: 49.4875, lng: 8.4660 },
  { id: '4', name: 'Polizeirevier Freiburg-Nord', praesidium: 'Freiburg', lat: 47.9990, lng: 7.8421 },
  { id: '5', name: 'Polizeirevier Heidelberg-Mitte', praesidium: 'Mannheim', lat: 49.4093, lng: 8.6901 },
]

export function Step2() {
  const [mode, setMode] = useState<'praesidium' | 'custom'>('praesidium')
  const [selectedPraesidium, setSelectedPraesidium] = useState<string>('')
  const [customAddress, setCustomAddress] = useState('')
  const { selectedTargets, customTargets, addTarget, removeTarget, addCustomTarget, setStep } = useStore()

  const filteredReviere = selectedPraesidium 
    ? POLIZEIREVIERE.filter(r => r.praesidium === selectedPraesidium)
    : POLIZEIREVIERE

  const handleAddCustom = () => {
    if (customAddress.trim()) {
      addCustomTarget({ street: customAddress, city: '', zip: '' })
      setCustomAddress('')
    }
  }

  const canContinue = selectedTargets.length > 0 || customTargets.length > 0

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Schritt 2: Ziele auswählen</h2>
      
      {/* Mode Toggle */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setMode('praesidium')}
          className={`px-4 py-2 rounded-lg transition ${
            mode === 'praesidium' 
              ? 'bg-police-blue text-white' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Polizeireviere
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-4 py-2 rounded-lg transition ${
            mode === 'custom' 
              ? 'bg-police-blue text-white' 
              : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Eigene Ziele
        </button>
      </div>

      {mode === 'praesidium' ? (
        <div className="space-y-4">
          {/* Präsidium Filter */}
          <select
            value={selectedPraesidium}
            onChange={(e) => setSelectedPraesidium(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-800"
          >
            <option value="">Alle Präsidien</option>
            <option value="Stuttgart">Präsidium Stuttgart</option>
            <option value="Karlsruhe">Präsidium Karlsruhe</option>
            <option value="Mannheim">Präsidium Mannheim</option>
            <option value="Freiburg">Präsidium Freiburg</option>
          </select>

          {/* Reviere Liste */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredReviere.map((revier) => (
              <label
                key={revier.id}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTargets.includes(revier.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      addTarget(revier.id)
                    } else {
                      removeTarget(revier.id)
                    }
                  }}
                  className="mr-3"
                />
                <MapPin className="mr-2 h-4 w-4 text-police-blue" />
                <div>
                  <div className="font-medium">{revier.name}</div>
                  <div className="text-sm text-gray-500">{revier.praesidium}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="text-sm text-gray-600">
            {selectedTargets.length} Revier(e) ausgewählt
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Custom Address Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Adresse eingeben..."
              className="flex-1 p-3 border rounded-lg dark:bg-gray-800"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-3 bg-police-green text-white rounded-lg hover:bg-police-green/90"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Custom Targets List */}
          <div className="space-y-2">
            {customTargets.map((target, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span>{target.street}</span>
                <button
                  onClick={() => {/* TODO: Remove custom target */}}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {customTargets.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Keine eigenen Ziele hinzugefügt
            </p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Zurück
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!canContinue}
          className={`px-6 py-3 rounded-lg ${
            canContinue
              ? 'bg-police-blue text-white hover:bg-police-blue/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Weiter
        </button>
      </div>
    </div>
  )
}
