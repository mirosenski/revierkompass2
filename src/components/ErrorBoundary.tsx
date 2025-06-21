import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Etwas ist schiefgelaufen
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
              </p>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-police-blue hover:bg-police-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-police-blue"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Erneut versuchen
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Spezielle Error Boundary für die Karte
export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('MapErrorBoundary caught an error:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Karte konnte nicht geladen werden
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Die Kartenansicht ist temporär nicht verfügbar.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-police-blue hover:bg-police-blue/90"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 