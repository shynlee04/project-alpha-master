import { createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {


  // FIX: Deduplicate children if they were added multiple times (e.g. by HMR or SSR re-evaluation)
  // The routeTree.gen.ts file side-effects the rootRoute by calling _addFileChildren, which can happen multiple times.
  if (routeTree.children?.length) {
    const seenIds = new Set<string>()
    const originalLength = routeTree.children.length
    routeTree.children = routeTree.children.filter((child) => {
      // Only deduplicate if child has a valid id
      const childId = child?.id
      if (!childId) {
        return true // Keep children without id
      }
      if (seenIds.has(childId)) {
        return false // Remove duplicate
      }
      seenIds.add(childId)
      return true
    })
    if (routeTree.children.length !== originalLength) {
      console.warn(`[Router] Deduplicated ${originalLength - routeTree.children.length} routes from root children`)
    }
  }

  // Debug route tree
  console.log('[Router] routeTree children:', routeTree.children?.map(c => c.id))

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent: () => <p>Not Found</p>,
  })

  return router
}
