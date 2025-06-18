import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-police-blue/10 to-police-green/10" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Finden Sie das nächste Polizeirevier
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Schnelle und präzise Entfernungsberechnung zu allen Polizeidienststellen 
            in Baden-Württemberg - mit Straßenrouting.
          </p>
          <button
            onClick={onStart}
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-police-blue hover:bg-police-blue/90 rounded-lg transition-colors"
          >
            Jetzt starten
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
