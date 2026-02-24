// Via-gent Service Worker
// Implements offline-first architecture with multiple caching strategies

const CACHE_VERSION = 'v1.0.0'
const CACHE_MAX_SIZE = 100 * 1024 * 1024 // 100MB max cache size

// Cache names for different strategies
const CACHE_NAMES = {
  STATIC: `via-gent-static-${CACHE_VERSION}`,
  API: `via-gent-api-${CACHE_VERSION}`,
  DYNAMIC: `via-gent-dynamic-${CACHE_VERSION}`,
  IMAGES: `via-gent-images-${CACHE_VERSION}`,
}

// Assets to cache immediately (cache-first strategy)
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  // Fonts and icons will be cached on-demand
]

// API routes to use network-first strategy
const API_ROUTES = [
  '/api/projects',
  '/api/files',
  '/api/messages',
  '/api/agents',
]

/**
 * Install event: Precache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', event)

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAMES.STATIC)

      // Cache static assets
      await cache.addAll(PRECACHE_ASSETS)

      // Force activation
      await self.skipWaiting()
      console.log('[SW] Installation complete, static assets cached')
    })()
  )
})

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', event)

  event.waitUntil(
    (async () => {
      // Get all cache names
      const cacheNames = await caches.keys()

      // Delete old caches
      await Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('via-gent-') &&
              !Object.values(CACHE_NAMES).includes(name)
            )
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )

      // Take control of all clients immediately
      await self.clients.claim()
      console.log('[SW] Activation complete, old caches cleaned')
    })()
  )
})

/**
 * Fetch event: Route requests to appropriate caching strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    // Only cache external fonts and images
    if (url.pathname.match(/\.(woff2?|ttf|otf|eot)$/)) {
      event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.IMAGES))
      return
    }
    return
  }

  // Route to appropriate strategy
  if (API_ROUTES.some((route) => url.pathname.startsWith(route))) {
    // API requests: Network first with cache fallback
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.API))
  } else if (url.pathname.match(/\.(js|css|json|svg|png|jpg|jpeg|gif|webp|ico)$/)) {
    // Static assets: Cache first
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.STATIC))
  } else if (url.pathname === '/' || url.pathname.match(/\.html?$/)) {
    // HTML: Network first, always try to get fresh content
    event.respondWith(networkFirstStrategy(request, CACHE_NAMES.DYNAMIC))
  } else {
    // Other routes: Stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAMES.DYNAMIC))
  }
})

/**
 * Cache First Strategy
 * Use cache immediately, update in background
 */
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request, cache)
    return cachedResponse
  }

  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request)

    // Clone and cache
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
      await enforceCacheSizeLimit(cacheName)
    }

    return networkResponse
  } catch (error) {
    console.error('[SW] Cache first failed:', error)
    return new Response('Offline - No cached data available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    })
  }
}

/**
 * Network First Strategy
 * Try network first, fallback to cache
 */
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    // Try network
    const networkResponse = await fetch(request)

    // Cache the response
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
      await enforceCacheSizeLimit(cacheName)
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)

    // Network failed, try cache
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      // Add header to indicate cached response
      const headers = new Headers(cachedResponse.headers)
      headers.append('X-From-Cache', 'true')

      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers,
      })
    }

    // Nothing in cache either
    return new Response('Offline - No cached data available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    })
  }
}

/**
 * Stale While Revalidate Strategy
 * Serve cache immediately, update in background
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  // Fetch in background
  const fetchPromise = fetchAndCache(request, cache)

  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse
  }

  // No cache, wait for network
  try {
    return await fetchPromise
  } catch (error) {
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    })
  }
}

/**
 * Fetch and cache helper
 */
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
      await enforceCacheSizeLimit(cache.name)
    }

    return networkResponse
  } catch (error) {
    console.error('[SW] Fetch and cache failed:', error)
    throw error
  }
}

/**
 * Enforce cache size limit with LRU eviction
 */
async function enforceCacheSizeLimit(cacheName) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  let totalSize = 0

  // Calculate total cache size
  for (const request of keys) {
    const response = await cache.match(request)
    if (response) {
      const sizeHeader = response.headers.get('Content-Length')
      if (sizeHeader) {
        totalSize += parseInt(sizeHeader, 10)
      } else {
        // Estimate size if no Content-Length header
        totalSize += response.blob().then((blob) => blob.size)
      }
    }
  }

  // If over limit, remove oldest entries
  if (totalSize > CACHE_MAX_SIZE) {
    console.log('[SW] Cache size limit exceeded, evicting old entries')

    // Sort keys by date (if available)
    const dateSortedKeys = keys.sort((a, b) => {
      const dateA = new Date(a.headers.get('Date') || 0)
      const dateB = new Date(b.headers.get('Date') || 0)
      return dateA - dateB
    })

    // Remove oldest entries until under limit
    for (const request of dateSortedKeys) {
      if (totalSize <= CACHE_MAX_SIZE * 0.8) {
        // Stop when we're at 80% of limit
        break
      }

      const response = await cache.match(request)
      if (response) {
        const sizeHeader = response.headers.get('Content-Length')
        const size = sizeHeader ? parseInt(sizeHeader, 10) : 0
        totalSize -= size

        await cache.delete(request)
        console.log('[SW] Evicted from cache:', request.url)
      }
    }
  }
}

/**
 * Message event: Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
        console.log('[SW] All caches cleared')
      })()
    )
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys()
        let totalSize = 0

        for (const name of cacheNames) {
          const cache = await caches.open(name)
          const keys = await cache.keys()

          for (const request of keys) {
            const response = await cache.match(request)
            if (response) {
              const blob = await response.blob()
              totalSize += blob.size
            }
          }
        }

        event.ports[0].postMessage({
          type: 'CACHE_SIZE',
          size: totalSize,
          sizeFormatted: formatBytes(totalSize),
        })
      })()
    )
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      (async () => {
        console.log('[SW] Background sync triggered')

        // Get queued requests from IndexedDB
        // Implementation depends on your background sync setup
        // This is a placeholder for where you'd process queued requests
      })()
    )
  }
})

/**
 * Push notification handler (optional, for future use)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
      })
    )
  }
})

console.log('[SW] Service worker loaded')
