import axios from 'axios'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org'

export interface GeocodingResult {
  lat: number
  lon: number
  display_name: string
  address: {
    road?: string
    house_number?: string
    postcode?: string
    city?: string
    state?: string
    town?: string
    village?: string
  }
}

export interface Address {
  street: string
  lat: number
  lng: number
  city?: string
  zip?: string
  state?: string
  fullAddress?: string
}

export async function geocodeAddress(query: string): Promise<GeocodingResult[]> {
  const response = await axios.get(`${NOMINATIM_URL}/search`, {
    params: {
      q: query,
      format: 'json',
      addressdetails: 1,
      limit: 5,
      countrycodes: 'de',
      viewbox: '7.5,47.5,10.5,49.8', // Baden-Württemberg Bounding Box
      bounded: 1
    }
  })
  return response.data
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult> {
  const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
    params: {
      lat,
      lon,
      format: 'json',
      addressdetails: 1
    }
  })
  return response.data
} 