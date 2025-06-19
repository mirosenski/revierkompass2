// MapLibre mit OSM Tiles (100% kostenlos)
export const MAP_CONFIG = {
  style: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap Contributors'
      }
    },
    layers: [
      {
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }
    ]
  }
}

// Alternative Styles
export const STYLE_URLS = {
  default: 'https://api.maptiler.com/maps/streets/style.json?key=YOUR_MAPTILER_KEY',
  osm: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=YOUR_MAPTILER_KEY',
  satellite: 'https://api.maptiler.com/maps/hybrid/style.json?key=YOUR_MAPTILER_KEY'
}
