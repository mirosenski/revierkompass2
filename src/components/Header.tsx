import { Moon, Sun, Monitor, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from './ThemeProvider'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src="/polizei-bw-logo.svg" alt="Polizei BW" className="h-10 w-auto" />
            <span className="ml-3 text-xl font-semibold">RevierKompass</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="hover:text-police-blue transition">Start</a>
            <a href="#" className="hover:text-police-blue transition">Über uns</a>
            <a href="#" className="hover:text-police-blue transition">Hilfe</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center glass rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded ${theme === 'light' ? 'bg-white/20' : ''}`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded ${theme === 'system' ? 'bg-white/20' : ''}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded ${theme === 'dark' ? 'bg-white/20' : ''}`}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
