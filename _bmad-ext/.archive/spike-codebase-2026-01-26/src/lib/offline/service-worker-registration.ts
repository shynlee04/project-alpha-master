/**
 * Service Worker Registration
 * Handles service worker registration and updates
 */

export interface ServiceWorkerRegistrationOptions {
  /**
   * Path to service worker file
   * @default '/sw.js'
   */
  swPath?: string

  /**
   * Called when service worker is registered
   */
  onRegistered?: (registration: ServiceWorkerRegistration) => void

  /**
   * Called when service worker is updated
   */
  onUpdated?: (registration: ServiceWorkerRegistration) => void

  /**
   * Called when service worker update is found
   */
  onUpdateFound?: (registration: ServiceWorkerRegistration) => void

  /**
   * Called when registration fails
   */
  onError?: (error: Error) => void
}

/**
 * Register service worker
 */
export async function registerServiceWorker(
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  const {
    swPath = '/sw.js',
    onRegistered,
    onUpdated,
    onUpdateFound,
    onError,
  } = options

  // Check if service worker is supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('[SW] Service worker not supported in this environment')
    return null
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register(swPath, {
      scope: '/',
    })

    console.log('[SW] Service worker registered successfully:', registration)

    // Check for updates
    if (registration.waiting) {
      // New service worker is waiting
      onUpdated?.(registration)
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing

      if (newWorker) {
        console.log('[SW] New service worker found')

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && registration.waiting) {
            // New service worker is ready
            onUpdated?.(registration)
          }
        })

        onUpdateFound?.(registration)
      }
    })

    // Listen for controller changes (service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Service worker activated')
      window.location.reload()
    })

    onRegistered?.(registration)
    return registration
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    console.error('[SW] Service worker registration failed:', err)
    onError?.(err)
    return null
  }
}

/**
 * Get service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    return registration ?? null
  } catch (error) {
    console.error('[SW] Failed to get service worker registration:', error)
    return null
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<boolean> {
  const registration = await getServiceWorkerRegistration()

  if (!registration) {
    return false
  }

  try {
    await registration.update()
    return true
  } catch (error) {
    console.error('[SW] Failed to check for updates:', error)
    return false
  }
}

/**
 * Skip waiting and activate new service worker
 */
export async function skipWaiting(): Promise<void> {
  const registration = await getServiceWorkerRegistration()

  if (!registration || !registration.waiting) {
    return
  }

  // Send message to waiting service worker to skip waiting
  registration.waiting.postMessage({ type: 'SKIP_WAITING' })
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()

    if (registration) {
      await registration.unregister()
      console.log('[SW] Service worker unregistered')
      return true
    }

    return false
  } catch (error) {
    console.error('[SW] Failed to unregister service worker:', error)
    return false
  }
}

/**
 * Check if service worker is active
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }

  const registration = await getServiceWorkerRegistration()
  return registration?.active !== undefined
}
