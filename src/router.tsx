import { createRouter } from '@tanstack/react-router'

// Import generated route tree (includes spike routes automatically)
import { routeTree } from './routeTree.gen'

// Create a singleton router instance for use outside React context
// ARCH-01-01: Export singleton for navigation in non-React code (command registry, error handlers, etc.)
const router = createRouter({
  routeTree: routeTree,
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <p>Not Found</p>,
})

// Export router instance for use in non-React contexts
export { router }

// Legacy function for backwards compatibility
export const getRouter = () => router
