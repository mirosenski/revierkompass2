import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import { useSpring, animated } from '@react-spring/web'

// Fix Leaflet Icon Issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
})

// Custom Icons
const createIcon = (color: string) => new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.5 0 0 5.5 0 12.5C0 21.5 12.5 41 12.5 41S25 21.5 25 12.5C25 5.5 19.5 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const startIcon = createIcon('#10b981')
const targetIcon = createIcon('#3b82f6')
const customIcon = createIcon('#f97316')

interface MapProps {
  start?: { lat: number; lng: number; address: string }
  targets: Array<{ id: string; lat: number; lng: number; name: string; type: 'police' | 'custom' }>
  routes?: Array<{ id: string; geometry: L.LatLng[]; distance: number; duration: number }>
  onMarkerClick?: (id: string) => void
  className?: string
}

function MapController({ start, targets }: Pick<MapProps, 'start' | 'targets'>) {
  const map = useMap()
  
  useEffect(() => {
    if (start || targets.length > 0) {
      const bounds = L.latLngBounds([])
      
      if (start) bounds.extend([start.lat, start.lng])
      targets.forEach(t => bounds.extend([t.lat, t.lng]))
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [map, start, targets])
  
  return null
}

export function InteractiveMap({ start, targets, routes, onMarkerClick, className = '' }: MapProps) {
  const AnimatedDiv = animated.div

  const animation = useSpring({
    from: { opacity: 0, transform: 'scale(0.95)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 200, friction: 20 }
  })

  return (
    <AnimatedDiv style={animation} className={className}>
      <MapContainer
        center={[48.7758, 9.1829]} // Stuttgart
        zoom={8}
        className="w-full h-full min-h-[400px]"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark:brightness-[0.6] dark:invert dark:contrast-[3] dark:hue-rotate-[200deg] dark:saturate-[0.3]"
        />
        
        <MapController start={start} targets={targets} />
        
        {/* Start Marker */}
        {start && (
          <Marker position={[start.lat, start.lng]} icon={startIcon}>
            <Popup>
              <div className="font-semibold">Startpunkt</div>
              <div className="text-sm">{start.address}</div>
            </Popup>
          </Marker>
        )}
        
        {/* Target Markers */}
        {targets.map((target) => (
          <Marker
            key={target.id}
            position={[target.lat, target.lng]}
            icon={target.type === 'police' ? targetIcon : customIcon}
            eventHandlers={{
              click: () => onMarkerClick?.(target.id)
            }}
          >
            <Popup>
              <div className="font-semibold">{target.name}</div>
              {routes?.find(r => r.id === target.id) && (
                <div className="text-sm mt-1">
                  <div>Entfernung: {(routes.find(r => r.id === target.id)!.distance / 1000).toFixed(1)} km</div>
                  <div>Fahrzeit: {Math.round(routes.find(r => r.id === target.id)!.duration / 60)} min</div>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
        
        {/* Routes */}
        {routes?.map((route) => (
          <Polyline
            key={route.id}
            positions={route.geometry}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        ))}
      </MapContainer>
    </AnimatedDiv>
  )
} 