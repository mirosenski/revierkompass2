import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

// Fix Leaflet Icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface SimpleMapProps {
  locations: Array<{
    id: string
    name: string
    coordinates: [number, number]
    type: 'start' | 'police' | 'custom'
  }>
  className?: string
}

export function SimpleMap({ locations, className = '' }: SimpleMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const routingControlRef = useRef<any>(null)

  useEffect(() => {
    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([48.7758, 9.1829], 8)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current!.removeLayer(layer)
      }
    })

    // Add markers
    const bounds = L.latLngBounds([])
    
    locations.forEach((location) => {
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${
              location.type === 'start' ? '#10b981' : 
              location.type === 'police' ? '#004B87' : '#f97316'
            };
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })

      const marker = L.marker([location.coordinates[1], location.coordinates[0]], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`<strong>${location.name}</strong>`)

      bounds.extend([location.coordinates[1], location.coordinates[0]])
    })

    // Fit bounds
    if (locations.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }

    // Add routing if we have start and destinations
    const start = locations.find(l => l.type === 'start')
    const destinations = locations.filter(l => l.type !== 'start')

    if (start && destinations.length > 0 && routingControlRef.current === null) {
      routingControlRef.current = (L as any).Routing.control({
        waypoints: [
          L.latLng(start.coordinates[1], start.coordinates[0]),
          ...destinations.slice(0, 1).map(d => 
            L.latLng(d.coordinates[1], d.coordinates[0])
          )
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        createMarker: () => null, // We already have markers
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 4, opacity: 0.7 }]
        }
      }).addTo(mapRef.current)
    }

    return () => {
      if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current)
        routingControlRef.current = null
      }
    }
  }, [locations])

  return <div id="map" className={`${className} rounded-lg`} />
}
