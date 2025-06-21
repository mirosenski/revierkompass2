const CACHE_NAME = 'revierkompass-v1'
const STATIC_CACHE = 'revierkompass-static-v1'
const DYNAMIC_CACHE = 'revierkompass-dynamic-v1'

// Statische Assets, die gecacht werden sollen
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index-BUpxpGUD.css',
  '/assets/index--JZni3zL.js',
  '/icons/custom-marker.svg',
  '/icons/police-marker.svg',
  '/icons/start-marker.svg',
  '/marker-icon.png',
  '/marker-icon-2x.png',
  '/marker-shadow.png'
]

// API-Endpunkte, die gecacht werden sollen
const API_CACHE_PATTERNS = [
  /nominatim\.openstreetmap\.org/,
  /router\.project-osrm\.org/,
  /graphhopper\.com/
]

// Install Event - Cache statische Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
  )
})

// Activate Event - Cleanup alte Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch Event - Intercept requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle static assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response
          }
          return fetch(request)
            .then((response) => {
              // Cache successful responses for static assets
              if (response.status === 200 && STATIC_ASSETS.includes(url.pathname)) {
                const responseClone = response.clone()
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
        })
    )
    return
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.hostname))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((response) => {
              if (response) {
                // Return cached response if available
                return response
              }

              // Fetch from network
              return fetch(request)
                .then((response) => {
                  // Cache successful API responses
                  if (response.status === 200) {
                    const responseClone = response.clone()
                    cache.put(request, responseClone)
                  }
                  return response
                })
                .catch((error) => {
                  console.log('Network request failed:', error)
                  
                  // For geocoding requests, return a fallback response
                  if (url.hostname === 'nominatim.openstreetmap.org') {
                    return new Response(JSON.stringify([]), {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' }
                    })
                  }
                  
                  // For routing requests, return error
                  if (url.hostname === 'router.project-osrm.org' || url.hostname === 'graphhopper.com') {
                    return new Response(JSON.stringify({ error: 'Routing service unavailable' }), {
                      status: 503,
                      headers: { 'Content-Type': 'application/json' }
                    })
                  }
                  
                  throw error
                })
            })
        })
    )
    return
  }

  // Default: network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request)
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    )
  }
})

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Neue Benachrichtigung',
    icon: '/icons/police-marker.svg',
    badge: '/icons/police-marker.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Öffnen',
        icon: '/icons/police-marker.svg'
      },
      {
        action: 'close',
        title: 'Schließen',
        icon: '/icons/police-marker.svg'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Revierkompass', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
}) 