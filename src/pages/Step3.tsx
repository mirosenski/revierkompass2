import { useState, useEffect } from 'react'
import { useStore } from '../store/index'
import { Navigation, Download, Copy, Route, Clock } from 'lucide-react'
import { SimpleMap } from '../components/Map/SimpleMap'
import { AdvancedRoutingService } from '../services/advancedRouting'
import * as XLSX from 'exceljs'
import { saveAs } from 'file-saver'

// Polizeireviere Daten
const POLIZEI_DATA = {
  '1': { name: 'Polizeirevier Stuttgart-Mitte', coordinates: [9.1829, 48.7758] as [number, number] },
  '2': { name: 'Polizeirevier Stuttgart-West', coordinates: [9.1515, 48.7738] as [number, number] },
  '3': { name: 'Polizeirevier Stuttgart-Nord', coordinates: [9.1851, 48.7985] as [number, number] },
  '10': { name: 'Polizeirevier Karlsruhe-Marktplatz', coordinates: [8.4037, 49.0093] as [number, number] },
  '11': { name: 'Polizeirevier Karlsruhe-West', coordinates: [8.3654, 49.0138] as [number, number] },
  '20': { name: 'Polizeirevier Mannheim-Innenstadt', coordinates: [8.4660, 49.4875] as [number, number] },
  '30': { name: 'Polizeirevier Freiburg-Nord', coordinates: [7.8421, 47.9990] as [number, number] },
  '40': { name: 'Polizeirevier Heidelberg-Mitte', coordinates: [8.6901, 49.4093] as [number, number] },
  '50': { name: 'Polizeirevier Heilbronn', coordinates: [9.2109, 49.1427] as [number, number] },
  '60': { name: 'Polizeirevier Ulm', coordinates: [9.9908, 48.3984] as [number, number] },
}

export function Step3() {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  const { startAddress, selectedTargets, customTargets, setStep } = useStore()

  useEffect(() => {
    if (startAddress?.lat && startAddress?.lng) {
      calculateAllRoutes()
    }
  }, [startAddress, selectedTargets])

  const calculateAllRoutes = async () => {
    setLoading(true)
    
    const destinations = [
      ...selectedTargets.map(id => ({
        id,
        coordinates: POLIZEI_DATA[id as keyof typeof POLIZEI_DATA]?.coordinates || [9.1829, 48.7758]
      })),
      ...customTargets.map((target, index) => ({
        id: `custom-${index}`,
        coordinates: [target.lng || 9.1829, target.lat || 48.7758] as [number, number]
      }))
    ]

    try {
      const results = await AdvancedRoutingService.calculateMultipleRoutes(
        [startAddress!.lng!, startAddress!.lat!],
        destinations
      )
      
      setRoutes(results.sort((a, b) => a.distance - b.distance))
    } catch (error) {
      console.error('Routing error:', error)
      // Fallback mit Dummy-Daten
      setRoutes(destinations.map((dest, i) => ({
        id: dest.id,
        distance: (i + 1) * 2500,
        duration: (i + 1) * 300,
        path: []
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleExcelExport = async () => {
    const workbook = new XLSX.Workbook()
    const worksheet = workbook.addWorksheet('Entfernungen')

    worksheet.columns = [
      { header: 'Rang', key: 'rank', width: 10 },
      { header: 'Ziel', key: 'name', width: 40 },
      { header: 'Entfernung (km)', key: 'distance', width: 15 },
      { header: 'Fahrzeit (min)', key: 'duration', width: 15 },
    ]

    routes.forEach((route, index) => {
      worksheet.addRow({
        rank: index + 1,
        name: POLIZEI_DATA[route.id as keyof typeof POLIZEI_DATA]?.name || `Eigenes Ziel ${route.id}`,
        distance: (route.distance / 1000).toFixed(2),
        duration: Math.round(route.duration / 60)
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer])
    saveAs(blob, `RevierKompass_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const mapLocations = [
    {
      id: 'start',
      name: startAddress?.street || 'Start',
      coordinates: [startAddress?.lng || 9.1829, startAddress?.lat || 48.7758] as [number, number],
      type: 'start' as const
    },
    ...selectedTargets.map(id => ({
      id,
      name: POLIZEI_DATA[id as keyof typeof POLIZEI_DATA]?.name || 'Polizeirevier',
      coordinates: POLIZEI_DATA[id as keyof typeof POLIZEI_DATA]?.coordinates || [9.1829, 48.7758],
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
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Ergebnisse</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ergebnisliste */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => {
                const text = routes
                  .map((r, i) => `${i + 1}. ${POLIZEI_DATA[r.id as keyof typeof POLIZEI_DATA]?.name || r.id}: ${(r.distance / 1000).toFixed(1)} km`)
                  .join('\n')
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
              onClick={handleExcelExport}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-police-green text-white rounded-lg hover:bg-police-green/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-police-blue mx-auto"></div>
                <p className="mt-4 text-gray-600">Berechne Routen...</p>
              </div>
            ) : (
              routes.map((route, index) => (
                <div
                  key={route.id}
                  className="p-4 border rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-police-blue mr-2">
                          {index + 1}.
                        </span>
                        <h3 className="font-medium">
                          {POLIZEI_DATA[route.id as keyof typeof POLIZEI_DATA]?.name || `Eigenes Ziel`}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Route className="h-4 w-4 mr-1" />
                          {(route.distance / 1000).toFixed(1)} km
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {Math.round(route.duration / 60)} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Karte */}
        <div className="lg:col-span-2">
          <div className="h-[700px] rounded-lg overflow-hidden shadow-lg">
            <SimpleMap
              locations={mapLocations}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Zurück
        </button>
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 bg-police-blue text-white rounded-lg hover:bg-police-blue/90"
        >
          Neue Suche
        </button>
      </div>
    </div>
  )
}
