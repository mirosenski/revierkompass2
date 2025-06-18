import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { geocodeAddress } from '../services/geocoding'
import { useDebounce } from '../hooks/useDebounce'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Straße, PLZ oder Ort eingeben...",
  className = ""
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedInput = useDebounce(input, 300)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['geocode', debouncedInput],
    queryFn: () => geocodeAddress(debouncedInput),
    enabled: debouncedInput.length > 2,
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (suggestion: any) => {
    const address = suggestion.display_name
    setInput(address)
    onChange(address, { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) })
    setShowSuggestions(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 w-full p-3 border rounded-lg dark:bg-gray-800 focus:ring-2 focus:ring-police-blue"
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start space-x-3 ${
                index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
              }`}
            >
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">
                  {suggestion.address.road} {suggestion.address.house_number}
                </div>
                <div className="text-sm text-gray-500">
                  {suggestion.address.postcode} {suggestion.address.city || suggestion.address.state}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
