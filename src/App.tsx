import { useState } from 'react'
import { ThemeProvider } from './components/ThemeProvider'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Footer } from './components/Footer'
import { Step1 } from './pages/Step1'
import { Step2 } from './pages/Step2'
import { Step3 } from './pages/Step3'
import { useStore } from './store/index'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './components/Toast'

function AppContent() {
  const [showWizard, setShowWizard] = useState(false)
  const { currentStep } = useStore()

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-black dark:text-white">
      <Header />
      
      {!showWizard ? (
        <Hero onStart={() => setShowWizard(true)} />
      ) : (
        <main className="flex-1 py-8">
          {/* Progress Bar */}
          <div className="max-w-4xl mx-auto px-6 mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                    step <= currentStep ? 'bg-police-blue' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Steps */}
          {currentStep === 1 && <Step1 />}
          {currentStep === 2 && <Step2 />}
          {currentStep === 3 && <Step3 />}
        </main>
      )}
      
      <Footer />
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
