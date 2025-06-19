// Für Entwicklung: Mapbox Public Token (ersetze später mit eigenem)
export const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

// Alternative: MapLibre für 100% Open Source
export const MAP_STYLE = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  navigation: 'mapbox://styles/mapbox/navigation-night-v1'
}

// OSRM Backend für Routing
export const ROUTING_API = {
  osrm: 'https://router.project-osrm.org/route/v1',
  graphhopper: 'https://graphhopper.com/api/1/route',
  valhalla: 'https://valhalla.mapzen.com/route'
} 