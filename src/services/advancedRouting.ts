import * as turf from '@turf/turf'
import polyline from '@mapbox/polyline'

export interface AdvancedRouteOptions {
  profile?: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking'
  avoid?: string[] // ['tolls', 'highways', 'ferries']
  optimize?: boolean
  alternatives?: number
  radiuses?: number[]
}

export class AdvancedRoutingService {
  private static async fetchOSRM(
    coordinates: [number, number][],
    options: AdvancedRouteOptions = {}
  ) {
    const profile = options.profile === 'driving-car' ? 'driving' : 'walking'
    const coords = coordinates.map(c => c.join(',')).join(';')
    
    const params = new URLSearchParams({
      overview: 'full',
      steps: 'true',
      geometries: 'geojson',
      alternatives: options.alternatives?.toString() || 'false',
      continue_straight: 'default',
      waypoints: coordinates.map((_, i) => i).join(';')
    })

    if (options.radiuses) {
      params.append('radiuses', options.radiuses.join(';'))
    }

    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${coords}?${params}`
    )
    
    return response.json()
  }

  private static async fetchGraphhopper(
    coordinates: [number, number][],
    options: AdvancedRouteOptions = {}
  ) {
    // GraphHopper implementation
    const points = coordinates.map(c => ({ lat: c[1], lng: c[0] }))
    
    const response = await fetch('https://graphhopper.com/api/1/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points,
        profile: options.profile || 'car',
        points_encoded: false,
        elevation: true,
        instructions: true,
        optimize: options.optimize || false,
        avoid: options.avoid || []
      })
    })
    
    return response.json()
  }

  static async calculateMultipleRoutes(
    start: [number, number],
    destinations: Array<{ id: string; coordinates: [number, number] }>,
    options: AdvancedRouteOptions = {}
  ) {
    // Batch-Optimierung für mehrere Ziele
    const batches = []
    const batchSize = 5 // OSRM Limit
    
    for (let i = 0; i < destinations.length; i += batchSize) {
      const batch = destinations.slice(i, i + batchSize)
      batches.push(batch)
    }

    const results = await Promise.all(
      batches.map(async (batch) => {
        const batchResults = await Promise.all(
          batch.map(async (dest) => {
            try {
              const data = await this.fetchOSRM([start, dest.coordinates], options)
              
              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0]
                
                return {
                  id: dest.id,
                  path: route.geometry.coordinates,
                  distance: route.distance,
                  duration: route.duration,
                  steps: route.legs[0].steps,
                  summary: route.legs[0].summary,
                  bounds: this.calculateBounds(route.geometry.coordinates)
                }
              }
              
              return null
            } catch (error) {
              console.error(`Routing error for ${dest.id}:`, error)
              return null
            }
          })
        )
        
        return batchResults.filter(Boolean)
      })
    )

    return results.flat()
  }

  static calculateBounds(coordinates: [number, number][]) {
    const lngs = coordinates.map(c => c[0])
    const lats = coordinates.map(c => c[1])
    
    return {
      southwest: [Math.min(...lngs), Math.min(...lats)],
      northeast: [Math.max(...lngs), Math.max(...lats)]
    }
  }

  static async optimizeRoute(
    waypoints: [number, number][],
    options: AdvancedRouteOptions = {}
  ) {
    // TSP-Optimierung für beste Reihenfolge
    const response = await this.fetchOSRM(waypoints, {
      ...options,
      optimize: true
    })

    if (response.routes && response.routes.length > 0) {
      const route = response.routes[0]
      const optimizedOrder = response.waypoints.map((wp: any) => wp.waypoint_index)
      
      return {
        path: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
        optimizedOrder,
        waypoints: response.waypoints
      }
    }

    throw new Error('Route optimization failed')
  }
}
