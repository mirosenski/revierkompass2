import { useState, useMemo } from 'react'
import { useStore } from '../store/index'
import { MapPin, Plus, X, Map, List, Grid3X3 } from 'lucide-react'
import { AddressAutocomplete } from '../components/AddressAutocomplete'
import { ProfessionalMap } from '../components/Map/ProfessionalMap'

// Erweiterte Polizeireviere Daten für ganz BW
const POLIZEIREVIERE = [
  // Stuttgart
  { id: '1', name: 'Polizeirevier Stuttgart-Mitte', praesidium: 'Stuttgart', lat: 48.7758, lng: 9.1829, adresse: 'Theodor-Heuss-Straße 10' },
  { id: '2', name: 'Polizeirevier Stuttgart-West', praesidium: 'Stuttgart', lat: 48.7738, lng: 9.1515, adresse: 'Büchsenstraße 35' },
  { id: '3', name: 'Polizeirevier Stuttgart-Nord', praesidium: 'Stuttgart', lat: 48.7985, lng: 9.1851, adresse: 'Löwentorstraße 11' },
  { id: '4', name: 'Polizeirevier Stuttgart-Ost', praesidium: 'Stuttgart', lat: 48.7841, lng: 9.2037, adresse: 'Ostendstraße 85' },
  { id: '5', name: 'Polizeirevier Stuttgart-Süd', praesidium: 'Stuttgart', lat: 48.7651, lng: 9.1728, adresse: 'Heusteigstraße 23' },
  
  // Karlsruhe
  { id: '10', name: 'Polizeirevier Karlsruhe-Marktplatz', praesidium: 'Karlsruhe', lat: 49.0093, lng: 8.4037, adresse: 'Karl-Friedrich-Straße 5' },
  { id: '11', name: 'Polizeirevier Karlsruhe-West', praesidium: 'Karlsruhe', lat: 49.0138, lng: 8.3654, adresse: 'Sophienstraße 128' },
  { id: '12', name: 'Polizeirevier Karlsruhe-Südwest', praesidium: 'Karlsruhe', lat: 48.9946, lng: 8.3846, adresse: 'Ettlinger Allee 3' },
  
  // Mannheim
  { id: '20', name: 'Polizeirevier Mannheim-Innenstadt', praesidium: 'Mannheim', lat: 49.4875, lng: 8.4660, adresse: 'L 6, 1' },
  { id: '21', name: 'Polizeirevier Mannheim-Oststadt', praesidium: 'Mannheim', lat: 49.4815, lng: 8.4939, adresse: 'Lortzingstraße 31' },
  { id: '22', name: 'Polizeirevier Mannheim-Neckarau', praesidium: 'Mannheim', lat: 49.4542, lng: 8.5067, adresse: 'Angelstraße 23' },
  
  // Freiburg
  { id: '30', name: 'Polizeirevier Freiburg-Nord', praesidium: 'Freiburg', lat: 47.9990, lng: 7.8421, adresse: 'Heinrich-von-Stephan-Straße 2' },
  { id: '31', name: 'Polizeirevier Freiburg-Süd', praesidium: 'Freiburg', lat: 47.9825, lng: 7.8491, adresse: 'Hofackerstraße 3' },
  
  // Weitere Städte
  { id: '40', name: 'Polizeirevier Heidelberg-Mitte', praesidium: 'Mannheim', lat: 49.4093, lng: 8.6901, adresse: 'Römerstraße 2-4' },
  { id: '41', name: 'Polizeirevier Heidelberg-Nord', praesidium: 'Mannheim', lat: 49.4251, lng: 8.6756, adresse: 'Dossenheimer Landstraße 33' },
  { id: '50', name: 'Polizeirevier Heilbronn', praesidium: 'Heilbronn', lat: 49.1427, lng: 9.2109, adresse: 'Bahnhofstraße 27' },
  { id: '60', name: 'Polizeirevier Ulm', praesidium: 'Ulm', lat: 48.3984, lng: 9.9908, adresse: 'Münsterplatz 50' },
]

const PRAESIDIEN = [...new Set(POLIZEIREVIERE.map(r => r.praesidium))].sort()

export function Step2() {
  const [mode, setMode] = useState<'praesidium' | 'custom'>('praesidium')
  const [selectedPraesidium, setSelectedPraesidium] = useState<string>('')
  const [customAddress, setCustomAddress] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  const { 
    selectedTargets, 
    customTargets, 
    addTarget, 
    removeTarget, 
    addCustomTarget, 
    setStep,
    startAddress 
  } = useStore()

  // Filter Reviere
  const filteredReviere = useMemo(() => {
    let filtered = POLIZEIREVIERE

    if (selectedPraesidium) {
      filtered = filtered.filter(r => r.praesidium === selectedPraesidium)
    }

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.adresse.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [selectedPraesidium, searchQuery])

  const handleAddCustom = (address: string, coordinates?: { lat: number; lng: number }) => {
    if (address.trim() && coordinates) {
      addCustomTarget({ 
        street: address, 
        city: '', 
        zip: '',
        lat: coordinates.lat,
        lng: coordinates.lng
      })
      setCustomAddress('')
    }
  }

  const canContinue = selectedTargets.length > 0 || customTargets.length > 0

  // Map Locations für Vorschau
  const mapLocations = [
    ...(startAddress?.lat && startAddress?.lng ? [{
      id: 'start',
      name: 'Start',
      coordinates: [startAddress.lng, startAddress.lat] as [number, number],
      type: 'start' as const
    }] : []),
    ...filteredReviere
      .filter(r => selectedTargets.includes(r.id))
      .map(r => ({
        id: r.id,
        name: r.name,
        coordinates: [r.lng, r.lat] as [number, number],
        type: 'police' as const
      })),
    ...customTargets.map((target, index) => ({
      id: `custom-${index}`,
      name: target.street || `Eigenes Ziel ${index + 1}`,
      coordinates: [target.lng || 9.1829, target.lat || 48.7758] as [number, number],
      type: 'custom' as const
    }))
  ]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Ziele auswählen</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Wählen Sie Polizeireviere oder geben Sie eigene Ziele ein
        </p>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => setMode('praesidium')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            mode === 'praesidium' 
              ? 'bg-police-blue text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <MapPin className="inline-block mr-2 h-5 w-5" />
          Polizeireviere
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            mode === 'custom' 
              ? 'bg-police-blue text-white' 
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <Plus className="inline-block mr-2 h-5 w-5" />
          Eigene Ziele
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linke Seite - Auswahl */}
        <div>
          {mode === 'praesidium' ? (
            <div className="space-y-4">
              {/* Filter */}
              <div className="space-y-3">
                <select
                  value={selectedPraesidium}
                  onChange={(e) => setSelectedPraesidium(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                >
                  <option value="">Alle Präsidien ({POLIZEIREVIERE.length} Reviere)</option>
                  {PRAESIDIEN.map(p => (
                    <option key={p} value={p}>
                      Präsidium {p} ({POLIZEIREVIERE.filter(r => r.praesidium === p).length} Reviere)
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Reviere suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-gray-800"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded ${viewMode === 'map' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                >
                  <Map className="h-5 w-5" />
                </button>
              </div>

              {/* Reviere Liste */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredReviere.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Keine Reviere gefunden</p>
                ) : (
                  filteredReviere.map((revier) => (
                    <label
                      key={revier.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
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
                        className="mr-3 h-5 w-5 text-police-blue"
                      />
                      <MapPin className="mr-2 h-4 w-4 text-police-blue flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{revier.name}</div>
                        <div className="text-sm text-gray-500">{revier.adresse}</div>
                        <div className="text-xs text-gray-400">{revier.praesidium}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedTargets.length} von {filteredReviere.length} Revieren ausgewählt
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Custom Address Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Adresse hinzufügen</label>
                <AddressAutocomplete
                  value={customAddress}
                  onChange={(address, coords) => {
                    setCustomAddress(address)
                    if (coords) {
                      handleAddCustom(address, coords)
                    }
                  }}
                  placeholder="Adresse eingeben und aus Vorschlägen wählen..."
                />
              </div>

              {/* Custom Targets List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {customTargets.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Keine eigenen Ziele hinzugefügt</p>
                    <p className="text-sm mt-2">Geben Sie oben eine Adresse ein</p>
                  </div>
                ) : (
                  customTargets.map((target, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                        <span>{target.street}</span>
                      </div>
                      <button
                        onClick={() => {
                          // TODO: Remove custom target
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {customTargets.length} eigene Ziele hinzugefügt (max. 10)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Rechte Seite - Karten-Vorschau */}
        <div className="lg:block">
          <div className="sticky top-4">
            <h3 className="font-semibold mb-3">Kartenvorschau</h3>
            <div className="h-[500px] rounded-lg overflow-hidden shadow-lg border">
              <ProfessionalMap
                locations={mapLocations}
                enableClustering={false}
                className="w-full h-full"
              />
            </div>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              <p>✓ {selectedTargets.length} Polizeireviere</p>
              <p>✓ {customTargets.length} Eigene Ziele</p>
            </div>
          </div>
        </div>
      </div>

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
          className={`px-6 py-3 rounded-lg font-medium transition ${
            canContinue
              ? 'bg-police-blue text-white hover:bg-police-blue/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Routen berechnen ({selectedTargets.length + customTargets.length})
        </button>
      </div>
    </div>
  )
}
