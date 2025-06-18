import L from 'leaflet'

const OSRM_URL = 'https://router.project-osrm.org/route/v1'

export interface RouteResult {
  distance: number // meters
  duration: number // seconds
  geometry: L.LatLng[]
  instructions: string[]
}

export async function calculateRoute(
  start: [number, number],
  end: [number, number],
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<RouteResult> {
  const url = `${OSRM_URL}/${profile}/${start[1]},${start[0]};${end[1]},${end[0]}`
  
  const response = await fetch(url + '?overview=full&steps=true&geometries=geojson')
  const data = await response.json()
  
  if (data.routes && data.routes.length > 0) {
    const route = data.routes[0]
    
    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry.coordinates.map((coord: [number, number]) => 
        L.latLng(coord[1], coord[0])
      ),
      instructions: route.legs[0].steps.map((step: any) => step.maneuver.instruction)
    }
  }
  
  throw new Error('Keine Route gefunden')
}

export async function calculateMultipleRoutes(
  start: [number, number],
  destinations: Array<{ id: string; coordinates: [number, number] }>
): Promise<Array<RouteResult & { id: string }>> {
  const results = await Promise.all(
    destinations.map(async (dest) => {
      try {
        const route = await calculateRoute(start, dest.coordinates)
        return { ...route, id: dest.id }
      } catch (error) {
        console.error(`Fehler bei Route zu ${dest.id}:`, error)
        return null
      }
    })
  )
  
  return results.filter((r): r is RouteResult & { id: string } => r !== null)
}
