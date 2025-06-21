import { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useToast } from '../Toast'
import { MapErrorBoundary } from '../ErrorBoundary'

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapProps {
  start?: { lat: number; lng: number; address?: string }
  destinations?: Array<{
    id: string
    lat: number
    lng: number
    name: string
    type: 'police' | 'custom'
  }>
  onRoutesCalculated?: (routes: RouteData[]) => void
}

interface RouteData {
  distance: number
  duration: number
  geometry: {
    type: 'LineString' | 'Point' | 'MultiPoint' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'GeometryCollection' | 'Feature' | 'FeatureCollection'
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

function MapComponent({ 
  start, 
  destinations = [], 
  onRoutesCalculated
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const isInitializedRef = useRef(false)
  const { addToast } = useToast()

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c * 1.4 // Factor 1.4 for road routing approximation
  }, [])

  // Create a simple fallback route (straight line)
  const createFallbackRoute = useCallback((startLat: number, startLng: number, endLat: number, endLng: number): RouteData[] => {
    const distance = calculateDistance(startLat, startLng, endLat, endLng) * 1000 // Convert to meters
    const duration = distance / 13.89 // Assume 50 km/h average speed (13.89 m/s)
    
    return [{
      distance: distance,
      duration: duration,
      geometry: {
        type: 'LineString',
        coordinates: [
          [startLng, startLat],
          [endLng, endLat]
        ]
      },
      summary: {
        totalDistance: distance,
        totalTime: duration
      },
      legs: [{
        steps: [
          {
            maneuver: {
              instruction: 'Geradeaus fahren'
            },
            distance: distance,
            duration: duration
          }
        ]
      }],
      instructions: ['Geradeaus fahren'],
      waypoints: [
        { location: [startLng, startLat] },
        { location: [endLng, endLat] }
      ]
    }]
  }, [calculateDistance])

  // Simple routing function using OSRM
  const calculateRoute = useCallback(async (startLat: number, startLng: number, endLat: number, endLng: number): Promise<RouteData[] | null> => {
    try {
      // Validate coordinates
      if (!startLat || !startLng || !endLat || !endLng) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Invalid coordinates:', { startLat, startLng, endLat, endLng })
        }
        addToast({
          type: 'warning',
          title: 'Ungültige Koordinaten',
          message: 'Die Start- oder Zielkoordinaten sind nicht korrekt.',
          duration: 4000
        })
        return null
      }

      // Try OSRM first with simplified parameters
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Requesting OSRM route:', osrmUrl)
      }
      
      const response = await fetch(osrmUrl)
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.routes && data.routes.length > 0) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('OSRM route calculated successfully:', data.routes.length, 'routes')
          }
          
          addToast({
            type: 'success',
            title: 'Route berechnet',
            message: `${data.routes.length} Route(n) erfolgreich berechnet.`,
            duration: 3000
          })
          
          // Ensure consistent data structure
          return data.routes.map((route: any): RouteData => ({
            distance: route.distance,
            duration: route.duration,
            geometry: route.geometry,
            summary: {
              totalDistance: route.distance,
              totalTime: route.duration,
              ...route.summary
            },
            legs: route.legs || [{
              steps: [{
                maneuver: { instruction: 'Geradeaus fahren' },
                distance: route.distance,
                duration: route.duration
              }]
            }],
            instructions: route.legs?.[0]?.steps?.map((step: any) => step.maneuver?.instruction) || ['Geradeaus fahren'],
            waypoints: route.waypoints || [
              { location: [startLng, startLat] },
              { location: [endLng, endLat] }
            ]
          }))
        }
      }
      
      // If OSRM fails, try GraphHopper (alternative routing service)
      if (process.env.NODE_ENV !== 'production') {
        console.log('OSRM failed, trying GraphHopper...')
      }
      
      addToast({
        type: 'info',
        title: 'Alternative Route',
        message: 'Versuche alternative Routing-API...',
        duration: 2000
      })
      
      const graphHopperUrl = `https://graphhopper.com/api/1/route?point=${startLat},${startLng}&point=${endLat},${endLng}&vehicle=car&locale=de&instructions=true&calc_points=true&key=demo`
      
      const ghResponse = await fetch(graphHopperUrl)
      
      if (ghResponse.ok) {
        const ghData = await ghResponse.json()
        
        if (ghData.paths && ghData.paths.length > 0) {
          const path = ghData.paths[0]
          if (process.env.NODE_ENV !== 'production') {
            console.log('GraphHopper route calculated successfully')
          }
          
          addToast({
            type: 'success',
            title: 'Alternative Route gefunden',
            message: 'Route über GraphHopper berechnet.',
            duration: 3000
          })
          
          return [{
            distance: path.distance,
            duration: path.time / 1000, // Convert to seconds
            geometry: {
              type: 'LineString',
              coordinates: path.points.coordinates || [
                [startLng, startLat],
                [endLng, endLat]
              ]
            },
            summary: {
              totalDistance: path.distance,
              totalTime: path.time / 1000
            },
            legs: [{
              steps: path.instructions?.map((instruction: any) => ({
                maneuver: {
                  instruction: instruction.text
                },
                distance: instruction.distance,
                duration: instruction.time / 1000
              })) || [{
                maneuver: {
                  instruction: 'Geradeaus fahren'
                },
                distance: path.distance,
                duration: path.time / 1000
              }]
            }],
            instructions: path.instructions?.map((instruction: any) => instruction.text) || ['Geradeaus fahren'],
            waypoints: [
              { location: [startLng, startLat] },
              { location: [endLng, endLat] }
            ]
          }]
        }
      }
      
      // If both APIs fail, use fallback
      if (process.env.NODE_ENV !== 'production') {
        console.log('Both APIs failed, using fallback route')
      }
      
      addToast({
        type: 'warning',
        title: 'Fallback-Route',
        message: 'Routing-APIs nicht verfügbar. Verwende Luftlinie.',
        duration: 4000
      })
      
      return createFallbackRoute(startLat, startLng, endLat, endLng)
      
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error calculating route:', error)
      }
      
      addToast({
        type: 'error',
        title: 'Routing-Fehler',
        message: 'Fehler beim Berechnen der Route. Verwende Fallback.',
        duration: 5000
      })
      
      return createFallbackRoute(startLat, startLng, endLat, endLng)
    }
  }, [createFallbackRoute, addToast])

  // Draw route on map
  const drawRoute = useCallback((routes: RouteData[], map: L.Map) => {
    // Clear existing route
    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current)
    }
    
    routeLayerRef.current = L.layerGroup().addTo(map)
    
    routes.forEach((route, index) => {
      if (route.geometry && route.geometry.coordinates) {
        const color = index === 0 ? '#3b82f6' : '#9ca3af'
        const weight = index === 0 ? 6 : 4
        const opacity = index === 0 ? 0.8 : 0.6
        
        if (process.env.NODE_ENV !== 'production') {
          console.log('Drawing route:', route.geometry.coordinates.length, 'points')
        }
        
        const routeLine = L.geoJSON(route.geometry, {
          style: {
            color: color,
            weight: weight,
            opacity: opacity
          }
        }).addTo(routeLayerRef.current!)
        
        // Add route info popup
        const distance = route.distance ? (route.distance / 1000).toFixed(1) : 'N/A'
        const duration = route.duration ? Math.round(route.duration / 60) : 'N/A'
        routeLine.bindPopup(`Route ${index + 1}: ${distance} km, ${duration} min`)
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn('Route has no geometry:', route)
      }
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return

    // Initialize map
    mapRef.current = L.map(containerRef.current, {
      zoomControl: false
    }).setView([48.7758, 9.1829], 8)

    // Add zoom control on the right
    L.control.zoom({ position: 'topright' }).addTo(mapRef.current)

    // Add tile layer with attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap | Routing: OSRM'
    }).addTo(mapRef.current)

    // Add scale
    L.control.scale({ imperial: false }).addTo(mapRef.current)

    isInitializedRef.current = true

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        isInitializedRef.current = false
      }
    }
  }, [])

  // Handle routing and markers
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return

    // Clear old route layer
    if (routeLayerRef.current) {
      try {
        if (mapRef.current && mapRef.current.hasLayer(routeLayerRef.current)) {
          mapRef.current.removeLayer(routeLayerRef.current)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Error removing route layer:', error)
        }
      }
      routeLayerRef.current = null
    }

    // Clear old markers safely
    markersRef.current.forEach(marker => {
      try {
        if (mapRef.current && mapRef.current.hasLayer(marker)) {
          mapRef.current.removeLayer(marker)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Error removing marker:', error)
        }
      }
    })
    markersRef.current = []

    if (!start || destinations.length === 0 || !mapRef.current) return

    // Custom icons
    const startIcon = L.divIcon({
      html: `
        <div style="
          background: #10b981; 
          width: 35px; 
          height: 35px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="background: white; width: 10px; height: 10px; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [35, 35],
      iconAnchor: [17.5, 17.5],
      className: ''
    })

    const policeIcon = L.divIcon({
      html: `
        <div style="
          background: #004B87; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">P</div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: ''
    })

    const customIcon = L.divIcon({
      html: `
        <div style="
          background: #f59e0b; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          border: 2px solid white; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">C</div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      className: ''
    })

    // Add markers
    const startMarker = L.marker([start.lat, start.lng], { icon: startIcon })
      .bindPopup(`<strong>Start</strong><br>${start.address || 'Ihre Position'}`)
      .addTo(mapRef.current!)
    markersRef.current.push(startMarker)

    destinations.forEach(dest => {
      const icon = dest.type === 'police' ? policeIcon : customIcon
      const destMarker = L.marker([dest.lat, dest.lng], { icon })
        .bindPopup(`<strong>${dest.name}</strong>`)
        .addTo(mapRef.current!)
      markersRef.current.push(destMarker)
    })

    // Calculate and draw route
    if (destinations.length > 0) {
      const dest = destinations[0]
      
      if (process.env.NODE_ENV !== 'production') {
        console.log('Calculating route from:', { lat: start.lat, lng: start.lng }, 'to:', { lat: dest.lat, lng: dest.lng })
      }
      
      // Use simple routing instead of Leaflet Routing Machine
      calculateRoute(start.lat, start.lng, dest.lat, dest.lng).then(routes => {
        if (routes && routes.length > 0 && mapRef.current) {
          if (process.env.NODE_ENV !== 'production') {
            console.log('Routes calculated, drawing on map:', routes.length, 'routes')
          }
          drawRoute(routes, mapRef.current)
          onRoutesCalculated?.(routes)
        } else if (process.env.NODE_ENV !== 'production') {
          console.warn('No routes calculated or map not available')
        }
      }).catch(error => {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Error calculating route:', error)
        }
        addToast({
          type: 'error',
          title: 'Routing-Fehler',
          message: 'Unbehandelter Fehler beim Berechnen der Route.',
          duration: 5000
        })
      })
    }

    // Fit bounds
    const bounds = L.latLngBounds([[start.lat, start.lng]])
    destinations.forEach(d => bounds.extend([d.lat, d.lng]))
    mapRef.current!.fitBounds(bounds, { padding: [50, 50] })

  }, [start, destinations, onRoutesCalculated, calculateRoute, drawRoute, addToast])

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      
      {/* Route Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Hauptroute</span>
          <div className="w-3 h-3 bg-gray-400 rounded-full ml-4"></div>
          <span>Alternative</span>
        </div>
      </div>
    </div>
  )
}

export function Map(props: MapProps) {
  return (
    <MapErrorBoundary>
      <MapComponent {...props} />
    </MapErrorBoundary>
  )
}
