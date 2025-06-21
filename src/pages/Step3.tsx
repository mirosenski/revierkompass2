import { useState, useEffect } from 'react'
import { useStore } from '../store/index'
import { Download, Copy, Route, Clock, Car, ChevronRight, MapPin } from 'lucide-react'
import { Map as MapComponent } from '../components/Map/Map'
import { POLIZEIREVIERE } from '../data/polizeireviere'
import * as XLSX from 'exceljs'
import { saveAs } from 'file-saver'

interface RouteDetails {
  distance: number
  duration: number
  instructions: string[]
  alternatives: RouteData[]
  routeGeometry?: {
    type: string
    coordinates: [number, number][]
  }
  waypoints: Array<{
    location: [number, number]
  }>
  steps: Array<{
    maneuver: {
      instruction: string
    }
    distance: number
    duration: number
  }>
}

interface RouteData {
  distance: number
  duration: number
  geometry: {
    type: string
    coordinates: [number, number][]
  }
  summary: {
    totalDistance: number
    totalTime: number
  }
  legs: Array<{
    steps: Array<{
      maneuver: {
        instruction: string
      }
      distance: number
      duration: number
    }>
  }>
  instructions: string[]
  waypoints: Array<{
    location: [number, number]
  }>
}

interface ResultItem {
  id: string
  name: string
  adresse: string
  tel: string
  distance: number
  duration: number
  lat: number
  lng: number
}

// Einfache Distanzberechnung (Luftlinie * 1.4 für Straßen-Approximation)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c * 1.4 // Faktor 1.4 für Straßenrouting
}

// Fahrtzeit schätzen (50 km/h Durchschnitt)
function estimateDuration(distanceKm: number): number {
  return Math.round(distanceKm / 50 * 60) // Minuten
}

export function Step3() {
  const [results, setResults] = useState<ResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)
  const [routeDetails, setRouteDetails] = useState<RouteDetails | null>(null)
  const [showDetailedRoute, setShowDetailedRoute] = useState(false)
  
  const { startAddress, selectedTargets, setStep } = useStore()

  useEffect(() => {
    if (startAddress && selectedTargets.length > 0) {
      calculateResults()
    }
  }, [startAddress, selectedTargets])

  const calculateResults = () => {
    if (!startAddress) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    
    const calculatedResults = selectedTargets.map(targetId => {
      const revier = POLIZEIREVIERE.find(r => r.id === targetId)
      if (!revier) return null
      
      const distance = calculateDistance(
        startAddress.lat,
        startAddress.lng,
        revier.lat,
        revier.lng
      )
      
      return {
        id: revier.id,
        name: revier.name,
        adresse: revier.adresse,
        tel: revier.tel,
        distance,
        duration: estimateDuration(distance),
        lat: revier.lat,
        lng: revier.lng
      }
    }).filter((result): result is NonNullable<typeof result> => result !== null).sort((a, b) => a.distance - b.distance)
    
    setResults(calculatedResults)
    if (calculatedResults.length > 0) {
      setSelectedDestination(calculatedResults[0].id)
    }
    setLoading(false)
  }

  const handleRoutesCalculated = (routes: RouteData[]) => {
    if (routes && routes.length > 0) {
      const route = routes[0]
      
      // Safely extract route details with fallbacks
      const distance = route.summary?.totalDistance || route.distance || 0
      const duration = route.summary?.totalTime || route.duration || 0
      const instructions = route.instructions || route.legs?.[0]?.steps || []
      const alternatives = routes.slice(1) || []
      
      setRouteDetails({
        distance: distance,
        duration: duration,
        instructions: instructions,
        alternatives: alternatives,
        // Add detailed route information
        routeGeometry: route.geometry,
        waypoints: route.waypoints || [],
        steps: route.legs?.[0]?.steps || []
      })
    }
  }

  const handleExport = async () => {
    const workbook = new XLSX.Workbook()
    const worksheet = workbook.addWorksheet('Polizeireviere')

    worksheet.columns = [
      { header: 'Rang', key: 'rank', width: 8 },
      { header: 'Polizeirevier', key: 'name', width: 35 },
      { header: 'Adresse', key: 'adresse', width: 40 },
      { header: 'Telefon', key: 'tel', width: 15 },
      { header: 'Entfernung', key: 'distance', width: 12 },
      { header: 'Fahrzeit', key: 'duration', width: 12 },
    ]

    results.forEach((result, index) => {
      worksheet.addRow({
        rank: index + 1,
        name: result.name,
        adresse: result.adresse,
        tel: result.tel,
        distance: `${result.distance.toFixed(1)} km`,
        duration: `${result.duration} min`
      })
    })

    // Styling
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF004B87' }
    }
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' } }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    saveAs(blob, `Polizeireviere_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const selectedDest = results.find(r => r.id === selectedDestination)
  const mapDestinations = selectedDest ? [{
    id: selectedDest.id,
    lat: selectedDest.lat,
    lng: selectedDest.lng,
    name: selectedDest.name,
    type: 'police' as const
  }] : []

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Nächste Polizeireviere</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ergebnisliste */}
        <div className="lg:col-span-1 space-y-4">
          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const text = results
                  .map((r, i) => `${i + 1}. ${r.name}\n   ${r.adresse}\n   Tel: ${r.tel}\n   ${r.distance.toFixed(1)} km - ${r.duration} min`)
                  .join('\n\n')
                navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex-1 flex items-center justify-center px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Kopiert!' : 'Kopieren'}
            </button>
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-police-green text-white rounded-lg hover:bg-police-green/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </button>
          </div>

          {/* Ergebnisse */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-police-blue mx-auto"></div>
                <p className="mt-4 text-gray-600">Berechne kürzeste Wege...</p>
              </div>
            ) : (
              results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => setSelectedDestination(result.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedDestination === result.id 
                      ? 'border-police-blue bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-2xl font-bold text-police-blue mr-3">
                          {index + 1}.
                        </span>
                        <h3 className="font-semibold text-lg">{result.name}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {result.adresse}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-blue-600 dark:text-blue-400">
                          <Route className="h-4 w-4 mr-1" />
                          {result.distance.toFixed(1)} km
                        </span>
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <Clock className="h-4 w-4 mr-1" />
                          {result.duration} min
                        </span>
                        <span className="flex items-center text-gray-600 dark:text-gray-400">
                          <Car className="h-4 w-4 mr-1" />
                          PKW
                        </span>
                      </div>
                      
                      <a 
                        href={`tel:${result.tel}`}
                        className="inline-flex items-center mt-2 text-sm text-police-blue hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📞 {result.tel}
                      </a>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 mt-2" />
                  </div>
                  
                  {selectedDestination === result.id && routeDetails && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Genaue Strecke:</span>
                          <span className="font-medium">{(routeDetails.distance / 1000).toFixed(1)} km</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Geschätzte Fahrzeit:</span>
                          <span className="font-medium">{Math.round(routeDetails.duration / 60)} min</span>
                        </div>
                        
                        {routeDetails.alternatives && routeDetails.alternatives.length > 0 && (
                          <div className="text-sm">
                            <span className="text-blue-600">
                              +{routeDetails.alternatives.length} alternative Routen verfügbar
                            </span>
                          </div>
                        )}
                        
                        {/* Detaillierte Wegbeschreibung */}
                        {routeDetails.steps && routeDetails.steps.length > 0 && (
                          <div className="mt-3">
                            <button
                              onClick={() => setShowDetailedRoute(!showDetailedRoute)}
                              className="text-sm text-police-blue hover:underline flex items-center"
                            >
                              <Route className="h-4 w-4 mr-1" />
                              {showDetailedRoute ? 'Wegbeschreibung ausblenden' : 'Detaillierte Wegbeschreibung anzeigen'}
                            </button>
                            
                            {showDetailedRoute && (
                              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-40 overflow-y-auto">
                                <div className="space-y-2 text-xs">
                                  {routeDetails.steps.map((step: any, index: number) => (
                                    <div key={index} className="flex items-start">
                                      <span className="text-gray-500 mr-2 min-w-[20px]">
                                        {index + 1}.
                                      </span>
                                      <span className="text-gray-700 dark:text-gray-300">
                                        {step.maneuver?.instruction || step.instruction || 'Weiterfahren'}
                                      </span>
                                      {step.distance && (
                                        <span className="text-gray-500 ml-2">
                                          ({(step.distance / 1000).toFixed(1)} km)
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Zusammenfassung */}
          {results.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Zusammenfassung</h3>
              <div className="text-sm space-y-1">
                <p>Start: <span className="font-medium">{startAddress?.street}</span></p>
                <p>Nächstes Revier: <span className="font-medium text-police-blue">{results[0]?.distance.toFixed(1)} km</span></p>
                <p>Anzahl Reviere: <span className="font-medium">{results.length}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Karte */}
        <div className="lg:col-span-2">
          <div className="h-[700px] rounded-lg overflow-hidden shadow-lg border bg-white dark:bg-gray-900">
            {startAddress ? (
              <MapComponent
                start={{
                  lat: startAddress.lat,
                  lng: startAddress.lng,
                  address: startAddress.street
                }}
                destinations={mapDestinations}
                onRoutesCalculated={handleRoutesCalculated}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Keine Startadresse gefunden</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Legende */}
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Start</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-police-blue rounded-full mr-2"></div>
              <span>Polizeirevier</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-1 bg-blue-500 mr-2"></div>
              <span>Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Zurück
        </button>
        <button
          onClick={() => {
            setStep(1)
            useStore.getState().reset()
          }}
          className="px-6 py-3 bg-police-blue text-white rounded-lg hover:bg-police-blue/90"
        >
          Neue Suche
        </button>
      </div>
    </div>
  )
}
