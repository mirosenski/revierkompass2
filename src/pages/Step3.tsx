import { useState, useEffect } from 'react'
import { useStore } from '../store/index'
import { Navigation, Download, Copy, MapPin } from 'lucide-react'

// Dummy Daten für Demo
const DUMMY_RESULTS = [
  { id: '1', name: 'Polizeirevier Stuttgart-Mitte', distance: 2.3, duration: 8 },
  { id: '2', name: 'Polizeirevier Stuttgart-West', distance: 4.1, duration: 12 },
  { id: '3', name: 'Polizeirevier Stuttgart-Nord', distance: 5.7, duration: 15 },
]

export function Step3() {
  const [results, setResults] = useState(DUMMY_RESULTS)
  const [copied, setCopied] = useState(false)
  const { setStep } = useStore()

  const handleCopy = () => {
    const text = results
      .map(r => `${r.name}: ${r.distance} km`)
      .join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = () => {
    // TODO: Excel Export implementieren
    alert('Excel Export wird implementiert...')
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Schritt 3: Ergebnisse</h2>

      {/* Export Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleCopy}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? 'Kopiert!' : 'Kopieren'}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-police-green text-white rounded-lg hover:bg-police-green/90"
        >
          <Download className="mr-2 h-4 w-4" />
          Excel Export
        </button>
      </div>

      {/* Results Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-4">Ziel</th>
              <th className="text-right p-4">Entfernung</th>
              <th className="text-right p-4">Fahrzeit</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={result.id}
                className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-police-blue" />
                    {result.name}
                  </div>
                </td>
                <td className="text-right p-4">{result.distance} km</td>
                <td className="text-right p-4">{result.duration} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Map Placeholder */}
      <div className="mt-6 h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Karte wird hier angezeigt</p>
        </div>
      </div>

      {/* Navigation Buttons */}
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
