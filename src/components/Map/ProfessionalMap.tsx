import { useRef, useState, useEffect, useCallback } from 'react'
import Map, { 
  Marker, 
  Source, 
  Layer, 
  NavigationControl, 
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  AttributionControl
} from 'react-map-gl'
import mapboxgl from 'mapbox-gl'
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import DeckGL from '@deck.gl/react'
import { PathLayer, IconLayer, TextLayer } from '@deck.gl/layers'
import * as turf from '@turf/turf'
import { MAPBOX_TOKEN, MAP_STYLE } from '../../config/map.config'
import { calculateRoute } from '../../services/routing'

// CSS Imports
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

// Mapbox Token setzen
mapboxgl.accessToken = MAPBOX_TOKEN

interface MapLocation {
  id: string
  name: string
  coordinates: [number, number]
  type: 'start' | 'police' | 'custom'
}

interface RouteData {
  id: string
  path: [number, number][]
  distance: number
  duration: number
  color?: string
}

interface ProfessionalMapProps {
  locations: MapLocation[]
  routes?: RouteData[]
  className?: string
  onLocationSelect?: (location: MapLocation) => void
  enableClustering?: boolean
  enable3D?: boolean
}

export function ProfessionalMap({
  locations,
  routes = [],
  className = '',
  onLocationSelect,
  enableClustering = true,
  enable3D = false
}: ProfessionalMapProps) {
  const mapRef = useRef<any>(null)
  const [viewState, setViewState] = useState({
    longitude: 9.1829,
    latitude: 48.7758,
    zoom: 8,
    pitch: enable3D ? 45 : 0,
    bearing: 0
  })
  const [mapStyle, setMapStyle] = useState(MAP_STYLE.streets)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)

  // Auto-fit to bounds
  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return

    const bounds = new mapboxgl.LngLatBounds()
    locations.forEach(loc => {
      bounds.extend(loc.coordinates)
    })

    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      duration: 1000
    })
  }, [locations])

  // DeckGL Layers
  const layers = [
    // Route Paths with Animation
    new PathLayer({
      id: 'routes',
      data: routes,
      getPath: (d: RouteData) => d.path,
      getColor: (d: RouteData) => [59, 130, 246, 200],
      getWidth: 5,
      widthMinPixels: 3,
      capRounded: true,
      jointRounded: true,
      billboard: true,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 0, 200],
      transitions: {
        getPath: 1000,
        getColor: 300
      }
    }),

    // Location Icons
    new IconLayer({
      id: 'locations',
      data: locations,
      getPosition: (d: MapLocation) => [...d.coordinates, 0],
      getIcon: (d: MapLocation) => ({
        url: `/icons/${d.type}-marker.svg`,
        width: 128,
        height: 128,
        anchorY: 128
      }),
      getSize: (d: MapLocation) => (d.id === selectedLocation ? 50 : 40),
      pickable: true,
      onClick: (info: any) => {
        if (info.object) {
          setSelectedLocation(info.object.id)
          onLocationSelect?.(info.object)
        }
      },
      transitions: {
        getSize: 300
      }
    }),

    // Location Labels
    new TextLayer({
      id: 'labels',
      data: locations,
      getPosition: (d: MapLocation) => [...d.coordinates, 0],
      getText: (d: MapLocation) => d.name,
      getSize: 14,
      getColor: [0, 0, 0],
      getBackgroundColor: [255, 255, 255, 200],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      getPixelOffset: [0, -50],
      billboard: true,
      fontFamily: 'Arial',
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: [255, 255, 255]
    })
  ]

  // Geocoder Control
  useEffect(() => {
    if (!mapRef.current) return

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl as any,
      marker: false,
      placeholder: 'Suche nach Orten...',
      bbox: [7.5, 47.5, 10.5, 49.8], // Baden-Württemberg
      countries: 'de',
      language: 'de'
    })

    mapRef.current.addControl(geocoder, 'top-left')

    return () => {
      mapRef.current.removeControl(geocoder)
    }
  }, [])

  // Heatmap Layer für Dichte
  const heatmapLayer = {
    id: 'location-heat',
    type: 'heatmap' as const,
    source: 'locations',
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ] as any, // TypeScript-Hack für die Kompatibilität
      'heatmap-radius': 30
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        reuseMaps
        antialias
        terrain={enable3D ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
      >
        {/* Controls */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl position="bottom-right" />
        <FullscreenControl position="top-right" />
        
        {/* Style Switcher */}
        <div className="absolute top-4 right-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="text-sm bg-transparent"
          >
            <option value={MAP_STYLE.streets}>Straßen</option>
            <option value={MAP_STYLE.satellite}>Satellit</option>
            <option value={MAP_STYLE.dark}>Dunkel</option>
            <option value={MAP_STYLE.navigation}>Navigation</option>
          </select>
        </div>

        {/* Location Source for Heatmap */}
        <Source
          id="locations"
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: locations.map(loc => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: loc.coordinates
              },
              properties: loc
            }))
          }}
        >
          {enableClustering && <Layer {...heatmapLayer} />}
        </Source>

        {/* DeckGL Overlay */}
        <DeckGL
          viewState={viewState}
          controller={true}
          layers={layers}
        />

        {/* 3D Buildings */}
        {enable3D && (
          <Layer
            id="3d-buildings"
            source="composite"
            source-layer="building"
            filter={['==', 'extrude', 'true']}
            type="fill-extrusion"
            minzoom={15}
            paint={{
              'fill-extrusion-color': '#aaa',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6
            }}
          />
        )}
      </Map>

      {/* Route Info Panel */}
      {routes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold mb-2">Routen-Informationen</h3>
          {routes.slice(0, 3).map(route => (
            <div key={route.id} className="text-sm mb-1">
              <span className="font-medium">{route.id}:</span>{' '}
              {(route.distance / 1000).toFixed(1)} km in {Math.round(route.duration / 60)} min
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
